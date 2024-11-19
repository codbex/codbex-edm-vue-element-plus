import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { CandidateApplicationRepository, CandidateApplicationEntityOptions } from "../../dao/RecruitmentAndOnboarding/CandidateApplicationRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-edm-vue-element-plus-RecruitmentAndOnboarding-CandidateApplication", ["validate"]);

@Controller
class CandidateApplicationService {

    private readonly repository = new CandidateApplicationRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: CandidateApplicationEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-edm-vue-element-plus/gen/model/api/RecruitmentAndOnboarding/CandidateApplicationService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            return this.repository.count();
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            return this.repository.count(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("CandidateApplication not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("CandidateApplication not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private validateEntity(entity: any): void {
        if (entity.CandidateName?.length > 64) {
            throw new ValidationError(`The 'CandidateName' exceeds the maximum length of [64] characters`);
        }
        if (entity.Email?.length > 32) {
            throw new ValidationError(`The 'Email' exceeds the maximum length of [32] characters`);
        }
        if (entity.ResumeLink?.length > 256) {
            throw new ValidationError(`The 'ResumeLink' exceeds the maximum length of [256] characters`);
        }
        if (entity.PhoneNumber?.length > 20) {
            throw new ValidationError(`The 'PhoneNumber' exceeds the maximum length of [20] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
