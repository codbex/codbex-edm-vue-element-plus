angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.PerformanceAndAttendance.PerformanceReview';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.ReviewPeriodFrom) {
				params.entity.ReviewPeriodFrom = new Date(params.entity.ReviewPeriodFrom);
			}
			if (params?.entity?.ReviewPeriodTo) {
				params.entity.ReviewPeriodTo = new Date(params.entity.ReviewPeriodTo);
			}
			if (params?.entity?.ReviewDateFrom) {
				params.entity.ReviewDateFrom = new Date(params.entity.ReviewDateFrom);
			}
			if (params?.entity?.ReviewDateTo) {
				params.entity.ReviewDateTo = new Date(params.entity.ReviewDateTo);
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
			if (entity.EmployeeName) {
				filter.$filter.contains.EmployeeName = entity.EmployeeName;
			}
			if (entity.ReviewPeriodFrom) {
				filter.$filter.greaterThanOrEqual.ReviewPeriod = entity.ReviewPeriodFrom;
			}
			if (entity.ReviewPeriodTo) {
				filter.$filter.lessThanOrEqual.ReviewPeriod = entity.ReviewPeriodTo;
			}
			if (entity.ReviewDateFrom) {
				filter.$filter.greaterThanOrEqual.ReviewDate = entity.ReviewDateFrom;
			}
			if (entity.ReviewDateTo) {
				filter.$filter.lessThanOrEqual.ReviewDate = entity.ReviewDateTo;
			}
			if (entity.Rating !== undefined) {
				filter.$filter.equals.Rating = entity.Rating;
			}
			if (entity.Comments) {
				filter.$filter.contains.Comments = entity.Comments;
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
			messageHub.closeDialogWindow("PerformanceReview-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);