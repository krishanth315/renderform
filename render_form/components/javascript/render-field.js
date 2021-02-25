Lyte.Component.register("render-field", {
    data: function() {
        return {
            dropdownValue: Lyte.attr('object', { default: { 'systemValue': 'value', 'userValue': 'name', 'placeholder': 'select' } })
        }
    },
    methods: {
        selectOnChange: function(event, target) {
            console.log("select on change triggered");
        },
        dateOnChange: function(event, target) {
            console.log("date on change triggered");
        },
        datetimeOnChange: function(event, target) {
            console.log("date time on change triggered");
        },
        checkboxOnChange: function(event, target) {
            console.log("checkbox on change triggered");
        }
    }
});