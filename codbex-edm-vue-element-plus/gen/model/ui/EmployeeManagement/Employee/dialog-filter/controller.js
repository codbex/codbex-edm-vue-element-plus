angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.EmployeeManagement.Employee';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DateOfJoiningFrom) {
				params.entity.DateOfJoiningFrom = new Date(params.entity.DateOfJoiningFrom);
			}
			if (params?.entity?.DateOfJoiningTo) {
				params.entity.DateOfJoiningTo = new Date(params.entity.DateOfJoiningTo);
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
			if (entity.FullName) {
				filter.$filter.contains.FullName = entity.FullName;
			}
			if (entity.Email) {
				filter.$filter.contains.Email = entity.Email;
			}
			if (entity.PhoneNumber) {
				filter.$filter.contains.PhoneNumber = entity.PhoneNumber;
			}
			if (entity.DateOfJoiningFrom) {
				filter.$filter.greaterThanOrEqual.DateOfJoining = entity.DateOfJoiningFrom;
			}
			if (entity.DateOfJoiningTo) {
				filter.$filter.lessThanOrEqual.DateOfJoining = entity.DateOfJoiningTo;
			}
			if (entity.Department !== undefined) {
				filter.$filter.equals.Department = entity.Department;
			}
			if (entity.Status !== undefined && entity.isStatusIndeterminate === false) {
				filter.$filter.equals.Status = entity.Status;
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
			messageHub.closeDialogWindow("Employee-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);