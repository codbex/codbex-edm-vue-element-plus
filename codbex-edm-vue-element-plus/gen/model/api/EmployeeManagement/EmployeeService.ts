import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { EmployeeRepository, EmployeeEntityOptions } from "../../dao/EmployeeManagement/EmployeeRepository";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-edm-vue-element-plus-EmployeeManagement-Employee", ["validate"]);

@Controller
class EmployeeService {

    private readonly repository = new EmployeeRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            const options: EmployeeEntityOptions = {
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
            response.setHeader("Content-Location", "/services/ts/codbex-edm-vue-element-plus/gen/model/api/EmployeeManagement/EmployeeService.ts/" + entity.Id);
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
                HttpUtils.sendResponseNotFound("Employee not found");
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
                HttpUtils.sendResponseNotFound("Employee not found");
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
        if (entity.FullName?.length > 64) {
            throw new ValidationError(`The 'FullName' exceeds the maximum length of [64] characters`);
        }
        if (entity.Email?.length > 32) {
            throw new ValidationError(`The 'Email' exceeds the maximum length of [32] characters`);
        }
        if (entity.PhoneNumber?.length > 20) {
            throw new ValidationError(`The 'PhoneNumber' exceeds the maximum length of [20] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
