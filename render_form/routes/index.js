Lyte.Router.registerRoute('index',{
	model : function()	{
		return {features : [{module : 'Router',url : 'http://lyte/2.0/doc/route/introduction'},
							{module : 'Components',url : 'http://lyte/2.0/doc/components/introduction'},
							{module : 'Data',url : 'http://lyte/2.0/doc/data/introduction'},
							{module : 'CLI',url : 'http://lyte/2.0/doc/cli/introduction'}
							]}
				
	},
	renderTemplate : function()	{
		return {outlet : "#outlet",component : "welcome-comp"}
	}
});
