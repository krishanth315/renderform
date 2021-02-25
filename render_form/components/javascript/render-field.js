Lyte.Component.register("render-field", {
    data: function() {
        return {
            dropdownValue: Lyte.attr('object', { default: { 'systemValue': 'value', 'userValue': 'name', 'placeholder': 'select' } })
        }
    },
    showElement: function(changeFldApi, element) {
        $L(element).closest('render-form').find('#' + changeFldApi).closest('.field-cont').show();
    },
    hideElement: function(changeFldApi, element) {
        $L(element).closest('render-form').find('#' + changeFldApi).closest('.field-cont').hide();
    },
    methods: {
        selectOnChange: function(target, fieldId) {
            debugger;
            var self = this;
            var fieldProperty = this.getData("fieldProperty")
            console.log("select on change triggered");
            if (fieldProperty.fsm_on_select && Object.keys(fieldProperty.fsm_on_select).length) {
                var checkValues = Object.keys(fieldProperty.fsm_on_select);
                var selectedValue = target.ltProp("selected") || null;
                if (checkValues.indexOf(selectedValue) != -1) {
                    actions = fieldProperty.fsm_on_select[selectedValue];
                } else if (checkValues.indexOf("*") != -1) {
                    actions = fieldProperty.fsm_on_select["*"];
                }
                $L.each(actions, function(index, fieldAction) {
                    if (isNaN(index)) {
                        var changeFldApi = index;
                    } else {
                        var changeFldApi = fieldAction.field_Api;
                    }
                    var actn = fieldAction.action;
                    if (Array.isArray(actn)) {
                        $L.each(actn, function(index, el) {
                            makeAction(el);
                        });
                    } else {
                        makeAction(actn);
                    }

                    function makeAction(actn) {
                        if (actn == "show") {
                            self.showElement(changeFldApi, $L(target));
                        }
                        if (actn == "hide") {
                            self.hideElement(changeFldApi, $L(target));
                            //comp todo
                            // self.setValueForField(changeFldApi, $L(target));
                        }
                        if (actn == "setcurrentvalue") {
                            //comp todo
                            // self.setValueForField(changeFldApi, $(target), selectedValue, true);
                        }
                        if (actn == "setstaticvalue") {
                            //comp todo
                            // self.setValueForField(changeFldApi, $(target), instance, fieldAction.value, true);
                        }
                    }
                })
            }
        },
        dateOnChange: function(target, fieldId) {
            console.log("date on change triggered");
        },
        datetimeOnChange: function(target, fieldId) {
            console.log("date time on change triggered");
        },
        checkboxOnChange: function(target, fieldId) {
            console.log("checkbox on change triggered");
        }
    }
});