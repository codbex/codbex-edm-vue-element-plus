angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.EmployeeManagement.EmploymentContract';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.ContractStartFrom) {
				params.entity.ContractStartFrom = new Date(params.entity.ContractStartFrom);
			}
			if (params?.entity?.ContractStartTo) {
				params.entity.ContractStartTo = new Date(params.entity.ContractStartTo);
			}
			if (params?.entity?.ContractEndFrom) {
				params.entity.ContractEndFrom = new Date(params.entity.ContractEndFrom);
			}
			if (params?.entity?.ContractEndTo) {
				params.entity.ContractEndTo = new Date(params.entity.ContractEndTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsContractType = params.optionsContractType;
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
			if (entity.ContractStartFrom) {
				filter.$filter.greaterThanOrEqual.ContractStart = entity.ContractStartFrom;
			}
			if (entity.ContractStartTo) {
				filter.$filter.lessThanOrEqual.ContractStart = entity.ContractStartTo;
			}
			if (entity.ContractEndFrom) {
				filter.$filter.greaterThanOrEqual.ContractEnd = entity.ContractEndFrom;
			}
			if (entity.ContractEndTo) {
				filter.$filter.lessThanOrEqual.ContractEnd = entity.ContractEndTo;
			}
			if (entity.Salary !== undefined) {
				filter.$filter.equals.Salary = entity.Salary;
			}
			if (entity.ContractType !== undefined) {
				filter.$filter.equals.ContractType = entity.ContractType;
			}
			if (entity.RenewalNoticePeriod !== undefined) {
				filter.$filter.equals.RenewalNoticePeriod = entity.RenewalNoticePeriod;
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
			messageHub.closeDialogWindow("EmploymentContract-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);