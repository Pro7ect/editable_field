var config = {
        keyMap: {
            "ESC": 27,
            "ENTER": 13
        }
    },
    app = angular.module('app', []);

app.controller('editInPlaceCtrl', function ($scope) {
    $scope.data = {
        inputValue: 'testValue',
        selectValue: [
            {id: '1', name: 'Option A'},
            {id: '2', name: 'Option B'},
            {id: '3', name: 'Option C'}
        ]
    };

    $scope.data.selectedOption = $scope.data.selectValue[0];
});


app.directive('editInPlace', function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            value: '=',
            options: '=',
            type: '@'
        },
        template: function (element, attrs) {
            return '<span ng-dblclick="edit()" ng-bind=' + ((attrs.type === 'input') ? ' value' : 'value.name') + '></span>' +
                '<input ng-if="type === \'input\'" ng-model="$parent.value">' +
                '<select ng-if="type === \'select\'" ng-options="option.name for option in options"  ng-model="$parent.value"></select>'
        },
        link: function ($scope, element, attrs) {
            //looks like because of "ng-if" directive nodes are not rendered at this point
            //which is why we use $timeout to work with them asynchronously
            $timeout(function () {
                    var keyMap = config.keyMap,
                        elType = attrs.type,
                        editableEl = element.find(attrs.type);

                    /**
                     * Handler for finishing editing
                     * @param {Boolean} state If true - we save the new value, if false - we revert changes
                     * @return {Function}
                     */
                    function finishEdit(state) {
                        state ?
                            $scope.prevValue = $scope.value :
                            $scope.value = $scope.prevValue;

                        $scope.editing = false;
                        element.removeClass('active');
                    }

                    // ng-dbclick handler to activate edit-in-place
                    $scope.edit = function () {
                        $scope.editing = true;

                        // display is controlled via class on the directive itself. See the CSS.
                        element.addClass('active active-' + elType);

                        //focus the element.
                        editableEl[0].focus();
                    };

                    // initially we're not editing.
                    $scope.editing = false;

                    //save previous value
                    $scope.prevValue = $scope.value;

                    // class for styling/reference
                    element.addClass('edit-in-place');

                    switch (elType) {
                        case 'input':
                            editableEl.on("keyup", function (e) {
                                if (e.keyCode === keyMap["ESC"]) {
                                    $scope.$apply(function () {
                                        finishEdit(false);
                                    });
                                }

                                if (e.keyCode === keyMap["ENTER"]) {
                                    finishEdit(true);
                                }

                            });
                            break;

                        case 'select':
                            editableEl.on("keyup", function (e) {
                                if (e.keyCode === keyMap["ESC"]) {
                                    $scope.$apply(function () {
                                        finishEdit(false);
                                    });
                                }
                            });

                            editableEl.on("keypress", function (e) {
                                if (e.keyCode === keyMap["ENTER"]) {
                                    finishEdit(true);
                                }

                            });
                            break;
                    }
            });

        }
    };
});

