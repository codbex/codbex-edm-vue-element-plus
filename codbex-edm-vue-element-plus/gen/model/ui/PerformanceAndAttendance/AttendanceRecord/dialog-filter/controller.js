angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.PerformanceAndAttendance.AttendanceRecord';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DateFrom) {
				params.entity.DateFrom = new Date(params.entity.DateFrom);
			}
			if (params?.entity?.DateTo) {
				params.entity.DateTo = new Date(params.entity.DateTo);
			}
			if (params?.entity?.CheckInTimeFrom) {
				params.entity.CheckInTimeFrom = new Date(params.entity.CheckInTimeFrom);
			}
			if (params?.entity?.CheckInTimeTo) {
				params.entity.CheckInTimeTo = new Date(params.entity.CheckInTimeTo);
			}
			if (params?.entity?.CheckOutTimeFrom) {
				params.entity.CheckOutTimeFrom = new Date(params.entity.CheckOutTimeFrom);
			}
			if (params?.entity?.CheckOutTimeTo) {
				params.entity.CheckOutTimeTo = new Date(params.entity.CheckOutTimeTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAttendanceStatus = params.optionsAttendanceStatus;
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
			if (entity.DateFrom) {
				filter.$filter.greaterThanOrEqual.Date = entity.DateFrom;
			}
			if (entity.DateTo) {
				filter.$filter.lessThanOrEqual.Date = entity.DateTo;
			}
			if (entity.CheckInTimeFrom) {
				filter.$filter.greaterThanOrEqual.CheckInTime = entity.CheckInTimeFrom;
			}
			if (entity.CheckInTimeTo) {
				filter.$filter.lessThanOrEqual.CheckInTime = entity.CheckInTimeTo;
			}
			if (entity.CheckOutTimeFrom) {
				filter.$filter.greaterThanOrEqual.CheckOutTime = entity.CheckOutTimeFrom;
			}
			if (entity.CheckOutTimeTo) {
				filter.$filter.lessThanOrEqual.CheckOutTime = entity.CheckOutTimeTo;
			}
			if (entity.AttendanceStatus !== undefined) {
				filter.$filter.equals.AttendanceStatus = entity.AttendanceStatus;
			}
			if (entity.Notes) {
				filter.$filter.contains.Notes = entity.Notes;
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
			messageHub.closeDialogWindow("AttendanceRecord-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);