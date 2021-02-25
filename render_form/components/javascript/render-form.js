Lyte.Component.register("render-form", {
    data: function() {
        return {
            fieldProperties: Lyte.attr("object", { default: {} }),
            formLayout: Lyte.attr("array", { default: [] }),
            recordData: Lyte.attr("object", { default: {} })
        }
    },
    init: function() {
        debugger;
        var layoutJson = this.getData("layoutData");

        this.manipulateLayoutData(layoutJson);

        console.log(this.getData("formLayout"));
    },
    reorderSequence: function(sections) {
        function sortByProperty(property) {
            return function(a, b) {
                if (a[property] > b[property])
                    return 1;
                else if (a[property] < b[property])
                    return -1;

                return 0;
            }
        }

        var sectionGroup = {};
        $L.each(sections, function(index, secData) {
            if (!sectionGroup[secData.group_number]) {
                sectionGroup[secData.group_number] = []
            }
            sectionGroup[secData.group_number].push(secData)
        })

        var newArray = [];
        $L.each(sectionGroup, function(index, sectionArray) {
            newArray = newArray.concat(sectionArray.sort(sortByProperty("section_number")));
        });
        return newArray;
    },
    sortJsonArrayByKey: function(array, key) {
        function GetSortOrder(prop) {
            return function(a, b) {
                if (a[prop] > b[prop]) {
                    return 1;
                } else if (a[prop] < b[prop]) {
                    return -1;
                }
                return 0;
            }
        }
        return array.sort(GetSortOrder(key))
    },
    copyAsValue: function(copiedData, data) {
        var self = this;
        if (copiedData == undefined && data != undefined) {
            if (Array.isArray(data))
                copiedData = [];
            else
                copiedData = {};
        }
        $L.each(data, function(key, value) {

            var type = typeof value;
            if (type == 'object') {
                value = self.copyAsValue(copiedData[key], value);
            }
            if (Array.isArray(data)) {
                if (copiedData.indexOf(value) == -1)
                    copiedData.push(value);
            } else
                copiedData[key] = value;
        })

        return copiedData;
    },
    convertPicklistValues: function(picklistvalues) {
        var listValues = [];
        for (let i = 0; i < picklistvalues.length; i++) {
            const element = picklistvalues[i];
            listValues.push({ name: element.display_value, value: element.display_value })
        }
        return listValues;
    },
    manipulateLayoutData: function(makeData) {
        var LayoutData = [];
        var currencyList = [];
        var fieldProperties = {};

        var self = this;

        var newSections = self.reorderSequence(makeData.sections);
        self.data.formType = "edit";

        $L.each(newSections, function(index, sectionData) {
            var sectionObj = { column: [], type: sectionData.fsm_section_type, module_name: sectionData.fsm_module_name, label: sectionData.fsm_section_label };
            if (sectionData.fsm_section_type == "simple") {
                sectionObj.column_count = sectionData.column_count;
                var column = [];
                $L.each(sectionData.fields, function(fieldIndex, fldDsta) {

                    var fieldData = self.copyAsValue({}, fldDsta)
                    if (!column[fieldData.column_number - 1]) {
                        column[fieldData.column_number - 1] = [];
                    }
                    column[fieldData.column_number - 1].push(fieldData);
                    self.data.fieldProperties[fieldData.fsm_field_api_name] = fieldData;
                    self.data.fieldProperties[fieldData.fsm_field_api_name].module_name = fieldData.fsm_field_api_name.slice(0, fieldData.fsm_field_api_name.indexOf("___"));
                    self.data.fieldProperties[fieldData.fsm_field_api_name].field_api = fieldData.fsm_field_api_name.slice(fieldData.fsm_field_api_name.indexOf("___") + 3);
                    // comp todo
                    // if (fieldData.fsm_data_type == "tax") {
                    //     Render_State[instance].tax_type = fieldData.tax_type;
                    // }


                    if (fieldData.fsm_data_type == "picklist") {
                        self.data.fieldProperties[fieldData.fsm_field_api_name].list_values = self.convertPicklistValues(self.data.fieldProperties[fieldData.fsm_field_api_name].pick_list_values);
                    }
                    if (self.data.recordData[fieldData.module_name] && (self.data.recordData[fieldData.module_name][fieldData.field_api] || self.data.recordData[fieldData.module_name][fieldData.field_api] == false)) {
                        self.data.fieldProperties[fieldData.fsm_field_api_name].field_value = self.data.recordData[fieldData.module_name][fieldData.field_api];
                        if ((fieldData.fsm_data_type == "tax" && !Render_Methods.isView(instance)) || fieldData.fsm_data_type == "discount" || fieldData.fsm_data_type == "unit") {
                            // comp todo
                            // if (self.data.fieldProperties[fieldData.fsm_field_api_name].taxList) {
                            //     Render_State[instance].allTax = self.data.fieldProperties[fieldData.fsm_field_api_name].taxList;
                            // }
                            self.data.fieldProperties[fieldData.fsm_field_api_name].field_value = self.data.recordData[fieldData.module_name];
                        }
                    }
                })

                $L.each(column, function(ind, val) {
                    if (val) {
                        val.sort(function(x, y) { return x["sequence_number"] - y["sequence_number"] });
                        column[ind] = val;
                    }
                })
                sectionObj.column = column;
                // $L.each(column, function(ind, colData) {
                //     if (!sectionObj.column[ind]) {
                //         sectionObj.column[ind] = [];
                //     }
                //     if (colData) {
                //         $L.each(colData, function(index, fieldData) {
                //             // sectionObj.column[ind].push(self.data.fieldProperties[fieldData.fsm_field_api_name]);
                //             sectionObj.column[ind].push(fieldData.fsm_field_api_name);
                //         })
                //     }
                // })
            } else if (sectionData.fsm_section_type == "parasub") {
                sectionObj.use_temporary_id = sectionData.use_temporary_id;
                sectionObj.add_line_item_button = sectionData.add_line_item_button;
                sectionObj.module_name = sectionData.module_name;
                sectionObj.dependentFields = {};
                var column = [];
                var dependentFields = {};
                var aggregateFields = [];
                $L.each(sectionData.fields, function(fieldIndex, fieldData) {
                    if (fieldData.aggregate_sequence_number) {
                        aggregateFields.push(fieldData);
                    } else if (!fieldData.parent_sequence_number) {
                        column.push(fieldData);
                    } else {
                        if (!dependentFields[fieldData.parent_sequence_number]) {
                            dependentFields[fieldData.parent_sequence_number] = [];
                        }
                        dependentFields[fieldData.parent_sequence_number].push(fieldData);
                    }
                    self.data.fieldProperties[fieldData.fsm_field_api_name] = fieldData;
                    self.data.fieldProperties[fieldData.fsm_field_api_name].module_name = fieldData.fsm_field_api_name.slice(0, fieldData.fsm_field_api_name.indexOf("___"));
                    self.data.fieldProperties[fieldData.fsm_field_api_name].field_api = fieldData.fsm_field_api_name.slice(fieldData.fsm_field_api_name.indexOf("___") + 3);
                    // comp todo
                    // if (self.data.fieldProperties[fieldData.fsm_field_api_name].fsm_data_type == "tax" && self.data.fieldProperties[fieldData.fsm_field_api_name].taxList) {
                    //     Render_State[instance].allTax = self.data.fieldProperties[fieldData.fsm_field_api_name].taxList;
                    // }
                })

                column.sort(function(x, y) { return x["sequence_number"] - y["sequence_number"] });

                $L.each(dependentFields, function(ind, val) {
                    val.sort(function(x, y) { return x["sequence_number"] - y["sequence_number"] });
                    dependentFields[ind] = val;
                })
                aggregateFields = self.sortJsonArrayByKey(aggregateFields, "aggregate_sequence_number");
                $L.each(column, function(ind, colData) {
                    sectionObj.column.push(self.data.fieldProperties[fieldData.fsm_field_api_name]);
                    // sectionObj.column.push(colData.fsm_field_api_name);
                })

                $L.each(dependentFields, function(ind, colData) {
                    if (!sectionObj.dependentFields[ind]) {
                        sectionObj.dependentFields[ind] = [];
                    }
                    $L.each(colData, function(index, fieldData) {
                        sectionObj.dependentFields[ind].push(fieldData.fsm_field_api_name);
                    })
                })
                sectionObj.aggregateFields = aggregateFields
            } else {
                sectionObj.fields = [];
                $L.each(sectionData.fields, function(fieldIndex, fldDsta) {
                    var fieldData = self.copyAsValue({}, fldDsta)
                    self.data.fieldProperties[fieldData.fsm_field_api_name] = fieldData;
                    self.data.fieldProperties[fieldData.fsm_field_api_name].module_name = fieldData.fsm_field_api_name.slice(0, fieldData.fsm_field_api_name.indexOf("___"));
                    self.data.fieldProperties[fieldData.fsm_field_api_name].field_api = fieldData.fsm_field_api_name.slice(fieldData.fsm_field_api_name.indexOf("___") + 3);
                    sectionObj.fields.push(self.data.fieldProperties[fieldData.fsm_field_api_name]);
                })
            }
            self.data.formLayout.push(sectionObj)
        })


        // comp todo
        // if (makeData.currencyList) {
        //     Render_State[instance].currencyList = makeData.currencyList;
        // }
    },
    actions: {
        saveClickHandler: function() {
            console.log("save function triggered");
            var formData = this.getFormData();

            $L('#valuebox').val(JSON.stringify(formData))

            this.executeMethod("onSave", formData);
        },
        cancelClickHandler: function() {
            console.log("cancel function triggered");
            this.executeMethod("onCancel")
        }
    },
    getElementValueByType: function(element, fieldProperties) {
        if (fieldProperties) {
            var type = fieldProperties.fsm_data_type;
            var valueAsJson = {};
            switch (type) {
                case "picklist":
                case "multipicklist":
                case "rating":
                case "taxauthority":
                case "currencypicklist":
                case "pos":
                case "statetax":
                case "gsttreatment":
                case "vattreatment":
                case "picklistid":
                    valueAsJson = element.ltProp("selected") || null;
                    break;
                    // case "tax":
                    // 	moduleName = fieldProperties.fsm_field_api_name.slice(0, fieldProperties.fsm_field_api_name.indexOf("___"));
                    // 	var $taxId = Render_Methods.getSiblingElement(element, moduleName + "___Tax_Id");
                    // 	var $taxExId = Render_Methods.getSiblingElement(element, moduleName + "___Tax_Exemption_Id");
                    // 	var tax = $(element).selectboxcreate('getSelectedValue') || null;
                    // 	var valueAsJson = "";
                    // 	if (tax && tax != "") {
                    // 		if (tax == "non-taxable") {
                    // 			var exempId = $taxExId.val();
                    // 			$.each(Render_State[instance].exemption_list, function(index, value) {
                    // 				if (exempId == value.tax_exemption_id) {
                    // 					valueAsJson += value.tax_exemption_code;
                    // 				}
                    // 			})
                    // 		} else {
                    // 			$.each(fieldProperties.taxList, function(index, value) {
                    // 				if (tax == value.tax_id) {
                    // 					// valueAsJson += value.tax_name + "(" + value.tax_percentage + "%)";
                    // 					valueAsJson += value.tax_name;
                    // 				}
                    // 			})
                    // 		}
                    // 	}
                    // 	if (valueAsJson == "") {
                    // 		valueAsJson = null;
                    // 	}
                    // 	break;
                case "boolean":
                    valueAsJson = element.ltProp("checked") || null;
                    break;
                case "textarea":
                case "text":
                case "phone":
                case "email":
                case "website":
                case "autonumber":
                    valueAsJson = element.ltProp("value") || null;
                    break;
                case "currency":
                case "exchangecurrency":
                case "double":
                case "formula":
                case "integer":
                case "discount":
                case "unit":
                    valueAsJson = element.ltProp("value") || null;
                    // valueAsJson = $(element).val() * 1 || 0;
                    break;
                    // yet to be supported
                    // case "website":
                    // case "multiselectlookup":
                    // case "multiselectpicklist":

                    //todo
                    // case "lookup":
                    // case "address":
                    // case "userlookup":
                    // case "ownerlookup":
                    // 	valueAsJson = $(element).createLookup('getSelectedValue') || null;
                    // 	break;
                case "datetime":
                    // var format = $(element).attr('placeholder') || "MM-DD-YYYY HH:mm:ss";
                    // valueAsJson = null;
                    // if (moment($(element).val(), format).isValid()) {
                    //     if (fieldProperties.fsm_return_date_format) {
                    //         valueAsJson = moment($(element).val(), format).format(fieldProperties.fsm_return_date_format) || null;
                    //     } else {
                    //         valueAsJson = moment($(element).val(), format).format("YYYY-MM-DDTHH:mm:ssZ") || null;
                    //     }
                    // }
                    valueAsJson = element.ltProp("currentDate") + "" + element.ltProp("defaultTime") || null;
                    break;
                case "date":
                    // var format = $(element).attr('placeholder') || "MM-DD-YYYY";
                    // valueAsJson = null;
                    // if (moment($(element).val(), format).isValid()) {
                    //     if (fieldProperties.fsm_return_date_format) {
                    //         valueAsJson = moment($(element).val(), format).format(fieldProperties.fsm_return_date_format) || null;
                    //     } else {
                    //         valueAsJson = moment($(element).val(), format).format("YYYY-MM-DD") || null;
                    //     }
                    // }
                    valueAsJson = element.ltProp("value") || null;
                    break;
                    // case "taxable":
                    // 	var parEleName = $(Render_State[instance].$element).attr("id") || "";
                    // 	var $radioBtnsELe = $(element).parent().find(".rf-taxable-rEle");
                    // 	var selectedValue = $($radioBtnsELe).find("input[name='" + parEleName + "taxable']:checked").val();
                    // 	if (selectedValue == "taxable") {
                    // 		valueAsJson = true;
                    // 	} else if (selectedValue == "non-taxable") {
                    // 		valueAsJson = false;
                    // 	} else {
                    // 		valueAsJson = null;
                    // 	}
                    // 	break;
            }
            // var respJson = Render_Methods.validateElementByType(element, valueAsJson, fieldProperties);
            // return { validator: respJson, value: valueAsJson };
            return { validator: { isValid: true }, value: valueAsJson }
        } else {
            return { value: null };
        }
    },
    getFormData: function(skipValidation) {
        var self = this;

        var fieldProperties = this.getData("fieldProperties");
        var finalJSON = {};
        var doNotReturn = false;
        var errorFields = [];
        debugger;

        $parentEle = this.$node;

        if (skipValidation != true) {
            $L($parentEle).find('.errorText').text("")
        }

        // get column view data
        var columnViewValueEle = $L($parentEle).find('.rf-valFld');
        $L.each(columnViewValueEle, function(index, $valueEle) {
            var fieldProperty = $valueEle.getData("fieldProperty")
            var fsm_api_name = $L($valueEle).attr('id');

            // var fieldProperty = fieldProperties[fsm_api_name];
            var moduleName = fsm_api_name.slice(0, fsm_api_name.indexOf('___'));
            var fieldName = fieldProperty.api_name;
            var valueResp = self.getElementValueByType($valueEle, fieldProperty);

            if (!valueResp.validator.isValid) {
                doNotReturn = true
                errorFields.push({ $ele: fieldProperty.$errorText, message: valueResp.validator.message })
            }
            if (!finalJSON[moduleName]) {
                finalJSON[moduleName] = {};
            }

            // if (Render_State[instance].options.getRecordId == true) {
            //     if (Render_State[instance].recordData && Render_State[instance].recordData[moduleName] && Render_State[instance].recordData[moduleName].id) {
            //         finalJSON[moduleName]["id"] = Render_State[instance].recordData[moduleName].id;
            //     }
            // }
            finalJSON[moduleName][fieldName] = valueResp.value;
            // if (Render_State[instance].currency_id) {
            //     finalJSON[moduleName]["$currency_symbol"] = Render_State[instance].currency_id;
            //     finalJSON[moduleName]["Currency"] = Render_State[instance].currency_iso_code;
            // }
        })

        return finalJSON;
    }

});