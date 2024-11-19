angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.RecruitmentAndOnboarding.JobPosting';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.PostingDateFrom) {
				params.entity.PostingDateFrom = new Date(params.entity.PostingDateFrom);
			}
			if (params?.entity?.PostingDateTo) {
				params.entity.PostingDateTo = new Date(params.entity.PostingDateTo);
			}
			if (params?.entity?.ApplicationDeadlineFrom) {
				params.entity.ApplicationDeadlineFrom = new Date(params.entity.ApplicationDeadlineFrom);
			}
			if (params?.entity?.ApplicationDeadlineTo) {
				params.entity.ApplicationDeadlineTo = new Date(params.entity.ApplicationDeadlineTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsDepartment = params.optionsDepartment;
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
			if (entity.JobTitle) {
				filter.$filter.contains.JobTitle = entity.JobTitle;
			}
			if (entity.JobDescription) {
				filter.$filter.contains.JobDescription = entity.JobDescription;
			}
			if (entity.Department !== undefined) {
				filter.$filter.equals.Department = entity.Department;
			}
			if (entity.PostingDateFrom) {
				filter.$filter.greaterThanOrEqual.PostingDate = entity.PostingDateFrom;
			}
			if (entity.PostingDateTo) {
				filter.$filter.lessThanOrEqual.PostingDate = entity.PostingDateTo;
			}
			if (entity.ApplicationDeadlineFrom) {
				filter.$filter.greaterThanOrEqual.ApplicationDeadline = entity.ApplicationDeadlineFrom;
			}
			if (entity.ApplicationDeadlineTo) {
				filter.$filter.lessThanOrEqual.ApplicationDeadline = entity.ApplicationDeadlineTo;
			}
			if (entity.RemoteOption !== undefined && entity.isRemoteOptionIndeterminate === false) {
				filter.$filter.equals.RemoteOption = entity.RemoteOption;
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
			messageHub.closeDialogWindow("JobPosting-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);