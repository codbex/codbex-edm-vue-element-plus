angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.RecruitmentAndOnboarding.CandidateApplication';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.PreferredStartDateFrom) {
				params.entity.PreferredStartDateFrom = new Date(params.entity.PreferredStartDateFrom);
			}
			if (params?.entity?.PreferredStartDateTo) {
				params.entity.PreferredStartDateTo = new Date(params.entity.PreferredStartDateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.CandidateName) {
				filter.$filter.contains.CandidateName = entity.CandidateName;
			}
			if (entity.Email) {
				filter.$filter.contains.Email = entity.Email;
			}
			if (entity.ResumeLink) {
				filter.$filter.contains.ResumeLink = entity.ResumeLink;
			}
			if (entity.PhoneNumber) {
				filter.$filter.contains.PhoneNumber = entity.PhoneNumber;
			}
			if (entity.PreferredStartDateFrom) {
				filter.$filter.greaterThanOrEqual.PreferredStartDate = entity.PreferredStartDateFrom;
			}
			if (entity.PreferredStartDateTo) {
				filter.$filter.lessThanOrEqual.PreferredStartDate = entity.PreferredStartDateTo;
			}
			if (entity.ExpectedSalary !== undefined) {
				filter.$filter.equals.ExpectedSalary = entity.ExpectedSalary;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("CandidateApplication-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);