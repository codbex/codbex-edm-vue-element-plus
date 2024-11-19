angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.PerformanceAndAttendance.AttendanceRecord';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-edm-vue-element-plus/gen/model/api/PerformanceAndAttendance/AttendanceRecordService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "AttendanceRecord Details",
			create: "Create AttendanceRecord",
			update: "Update AttendanceRecord"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.Date) {
				params.entity.Date = new Date(params.entity.Date);
			}
			if (params.entity.CheckInTime) {
				params.entity.CheckInTime = new Date(params.entity.CheckInTime);
			}
			if (params.entity.CheckOutTime) {
				params.entity.CheckOutTime = new Date(params.entity.CheckOutTime);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsAttendanceStatus = params.optionsAttendanceStatus;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					$scope.errorMessage = `Unable to create AttendanceRecord: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("AttendanceRecord", "AttendanceRecord successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					$scope.errorMessage = `Unable to update AttendanceRecord: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("AttendanceRecord", "AttendanceRecord successfully updated");
			});
		};

		$scope.serviceAttendanceStatus = "/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/AttendanceStatusService.ts";

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("AttendanceRecord-details");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);