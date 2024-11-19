angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-edm-vue-element-plus.EmployeeManagement.Employee';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-edm-vue-element-plus/gen/model/api/EmployeeManagement/EmployeeService.ts";
	}])
	.controller('PageController', ['$scope', '$http', 'messageHub', 'entityApi', 'Extensions', function ($scope, $http, messageHub, entityApi, Extensions) {

		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-edm-vue-element-plus-custom-action').then(function (response) {
			$scope.pageActions = response.filter(e => e.perspective === "EmployeeManagement" && e.view === "Employee" && (e.type === "page" || e.type === undefined));
			$scope.entityActions = response.filter(e => e.perspective === "EmployeeManagement" && e.view === "Employee" && e.type === "entity");
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
					messageHub.showAlertError("Employee", `Unable to count Employee: '${response.message}'`);
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
						messageHub.showAlertError("Employee", `Unable to list/filter Employee: '${response.message}'`);
						return;
					}

					response.data.forEach(e => {
						if (e.DateOfJoining) {
							e.DateOfJoining = new Date(e.DateOfJoining);
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
			messageHub.showDialogWindow("Employee-details", {
				action: "select",
				entity: entity,
				optionsDepartment: $scope.optionsDepartment,
			});
		};

		$scope.openFilter = function (entity) {
			messageHub.showDialogWindow("Employee-filter", {
				entity: $scope.filterEntity,
				optionsDepartment: $scope.optionsDepartment,
			});
		};

		$scope.createEntity = function () {
			$scope.selectedEntity = null;
			messageHub.showDialogWindow("Employee-details", {
				action: "create",
				entity: {},
				optionsDepartment: $scope.optionsDepartment,
			}, null, false);
		};

		$scope.updateEntity = function (entity) {
			messageHub.showDialogWindow("Employee-details", {
				action: "update",
				entity: entity,
				optionsDepartment: $scope.optionsDepartment,
			}, null, false);
		};

		$scope.deleteEntity = function (entity) {
			let id = entity.Id;
			messageHub.showDialogAsync(
				'Delete Employee?',
				`Are you sure you want to delete Employee? This action cannot be undone.`,
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
							messageHub.showAlertError("Employee", `Unable to delete Employee: '${response.message}'`);
							return;
						}
						$scope.loadPage($scope.dataPage, $scope.filter);
						messageHub.postMessage("clearDetails");
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsDepartment = [];


		$http.get("/services/ts/codbex-edm-vue-element-plus/gen/model/api/EmployeeManagement/DepartmentService.ts").then(function (response) {
			$scope.optionsDepartment = response.data.map(e => {
				return {
					value: e.Id,
					text: e.Name
				}
			});
		});

		$scope.optionsDepartmentValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsDepartment.length; i++) {
				if ($scope.optionsDepartment[i].value === optionKey) {
					return $scope.optionsDepartment[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//

	}]);
