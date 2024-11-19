angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.EmployeeManagement.EmploymentContract';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-edm-vue-element-plus/gen/model/api/EmployeeManagement/EmploymentContractService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-edm-vue-element-plus-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "EmployeeManagement" && e.view === "EmploymentContract" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "EmployeeManagement" && e.view === "EmploymentContract" && e.type === "entity");
		});

		$scope.triggerPageAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{},
				null,
				true,
				action
			);
		};

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("entityCreated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entityUpdated", function (msg) {
			$scope.loadPage($scope.dataPage, $scope.filter);
		});

		messageHub.onDidReceiveMessage("entitySearch", function (msg) {
			resetPagination();
			$scope.filter = msg.data.filter;
			$scope.filterEntity = msg.data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		});
		//-----------------Events-------------------//

		$scope.loadPage = function (pageNumber, filter) {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			$scope.dataPage = pageNumber;
			entityApi.count(filter).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("EmploymentContract", `Unable to count EmploymentContract: '${response.message}'`);
					return;
				}
				if (response.data) {
					$scope.dataCount = response.data;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = entityApi.search(filter);
				} else {
					request = entityApi.list(offset, limit);
				}
				request.then(function (response) {
					if (response.status != 200) {
						messageHub.showAlertError("EmploymentContract", `Unable to list/filter EmploymentContract: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.ContractStart) {
							e.ContractStart = new Date(e.ContractStart);
						}
						if (e.ContractEnd) {
							e.ContractEnd = new Date(e.ContractEnd);
						}
					});

					$scope.data = response.data;
				});
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = function (entity) {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = function (entity) {
			$scope.selectedEntity = entity;
			messageHub.showDialogWindow("EmploymentContract-details", {
				action: "select",
				entity: entity,
				optionsContractType: $scope.optionsContractType,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("EmploymentContract-filter", {
				entity: $scope.filterEntity,
				optionsContractType: $scope.optionsContractType,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("EmploymentContract-details", {
				action: "create",
				entity: {},
				optionsContractType: $scope.optionsContractType,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("EmploymentContract-details", {
				action: "update",
				entity: entity,
				optionsContractType: $scope.optionsContractType,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete EmploymentContract?',
				`Are you sure you want to delete EmploymentContract? This action cannot be undone.`,
				[{
					id: "delete-btn-yes",
					type: "emphasized",
					label: "Yes",
				},
				{
					id: "delete-btn-no",
					type: "normal",
					label: "No",
				}],
			).then(function (msg) {
				if (msg.data === "delete-btn-yes") {
					entityApi.delete(id).then(function (response) {
						if (response.status != 204) {
							messageHub.showAlertError("EmploymentContract", `Unable to delete EmploymentContract: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsContractType = [];


		$http.get("/services/ts/codbex-edm-vue-element-plus/gen/model/api/Settings/ContractTypeService.ts").then(function (response) {
			$scope.optionsContractType = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsContractTypeValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsContractType.length; i++) {
				if ($scope.optionsContractType[i].value === optionKey) {
					return $scope.optionsContractType[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
