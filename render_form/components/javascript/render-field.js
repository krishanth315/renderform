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
    setValueForField: function(changeFldApi, $ele, value, highlight) {
        var changeFieldELement = $($ele).closest("render-form").find("#" + changeFldApi);
        var changeFieldProperty = changeFieldELement.getData("fieldProperty");
        datatype = changeFieldProperty.data_type;

        //comp todo
        if (highlight) {
            $(changeFieldELement).closest('.field-value').addClass('fieldHightlight');
            $(changeFieldELement).closest('.field-value').removeClass('fieldHightlight', 5000);
        }
        switch (datatype) {
            case "picklist":
            case "gsttreatment":
            case "vattreatment":
            case "picklistid":
            case "pos":
            case "statetax":
            case "currencypicklist":
            case "rating":
            case "tax":
                value = value || "";
                changeFieldELement.ltProp("checked", value, true)
                break;
            case "lookup":
            case "address":
            case "userlookup":
            case "ownerlookup":
                // comp todo
                // value = value || {};
                // $(depFld).createLookup('setLookupValue', value)
                break;
            case "textarea":
                value = value || "";
                changeFieldELement.ltProp("value", value)
                break;
            case "userlookup":
                // comp todo
                // value = value || {};
                // $(depFld).createLookup('setLookupValue', value)
                break;
            case "currency":
                // comp todo
                // if (isNaN(value)) {
                //     value = 0;
                // }
                // var fieldProperty = Render_State[instance].fieldProperties[changeFldApi] || {};
                // var currencySym = fieldProperty.currencySymbol || Render_State[instance].currency_symbol;
                // $(depFld).val(Render_Methods.parseCurrencyValue(instance, currencySym, value, fieldProperty, true))
                //     // $(depFld).val(value);
                // $(depFld).change();
                break;
            case "double":
            case "formula":
            case "integer":
            case "discount":
            case "unit":
                if (isNaN(value)) {
                    value = 0;
                }
                changeFieldELement.ltProp("value", value)
                $L(depFld).change();
                break;
            case "exchangecurrency":
                // comp todo
                // if (isNaN(value)) {
                //     value = 0;
                // }

                // if (!Render_State[instance].unitFlds) {
                //     Render_State[instance].unitFlds = [];
                // }
                // Render_State[instance].unitFlds.push(depFld);
                // $(depFld).data("originalvalue", value);
                // var exchRate = Number(Render_State[instance].exchange_rate) || 1;

                // var fieldProperty = Render_State[instance].fieldProperties[changeFldApi] || {};
                // var currencySym = fieldProperty.currencySymbol || Render_State[instance].currency_symbol;
                // var newVal = Number(Render_Methods.parseCurrencyValue(instance, currencySym, value * exchRate, fieldProperty, true))
                //     // var newVal = Number((value / exchRate).toFixed(2));
                // $(depFld).val(newVal)
                // $(depFld).change();
                break;
            case "taxable":
                // comp todo
                // var $taxableDiv = $(depFld).closest('.rf-taxable');
                // // todo -  handle value
                // // $($taxableDiv).find('.rf-taxable-rbtn').prop('checked', false)

                // if (value == undefined || value == null) {
                //     $($taxableDiv).find("#rf-radio-tax").prop('checked', false)
                //     $($taxableDiv).find("#rf-radio-ntax").prop('checked', false)
                //     $('#rf-radio-tax').change();
                // } else if (value == true) {
                //     // $($taxableDiv).find("#rf-radio-ntax").prop('checked', false)
                //     $($taxableDiv).find("#rf-radio-tax").prop('checked', true);
                //     $('#rf-radio-tax').change();
                // } else if (value == false) {
                //     // $($taxableDiv).find("#rf-radio-tax").prop('checked', false)
                //     $($taxableDiv).find("#rf-radio-ntax").prop('checked', true)
                //     $('#rf-radio-ntax').change();
                // }
                break;
            default:
                value = value || "";
                changeFieldELement.ltProp("value", value)
                $L(depFld).change();
        }
    },
    executeOnchangeAction: function(target, fieldId, fieldValue) {
        var self = this;
        var fieldProperty = this.getData("fieldProperty")
        console.log("select on change triggered");
        if (fieldProperty.fsm_on_select && Object.keys(fieldProperty.fsm_on_select).length) {
            var checkValues = Object.keys(fieldProperty.fsm_on_select);
            var selectedValue = fieldValue;
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
                        self.setValueForField(changeFldApi, $L(target));
                    }
                    if (actn == "setcurrentvalue") {
                        //comp todo
                        self.setValueForField(changeFldApi, $(target), selectedValue, true);
                    }
                    if (actn == "setstaticvalue") {
                        //comp todo
                        self.setValueForField(changeFldApi, $(target), fieldAction.value, true);
                    }
                }
            })
        }
    },
    methods: {
        selectOnChange: function(target, fieldId) {
            debugger;
            var fieldValue = target.ltProp("selected") || null;
            this.executeOnchangeAction(target, fieldId, fieldValue)
        },
        dateOnChange: function(target, fieldId) {
            console.log("date on change triggered");
        },
        datetimeOnChange: function(target, fieldId) {
            console.log("date time on change triggered");
        },
        checkboxOnChange: function(target, fieldId) {
            console.log("checkbox on change triggered");
            var fieldValue = target.ltProp("checked") || null;
            this.executeOnchangeAction(target, fieldId, "" + fieldValue)
        }
    }
});