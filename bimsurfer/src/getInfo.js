define(function() {
	var getBIMComponentInfo = function(guid){
		$.ajax({
	    	type:'post',
	    	url:"/springmvcMaven/getComponentByGuid.do",
	    	dataType:"json",
	    	contentType: "application/x-www-form-urlencoded; charset=utf-8",
	    	data:{
	    		cid: guid
	    	},
	    	success:function(data){
	    		return data;
	    	},
	    	error:function(jqXHR){
	    		//alert("dd");
	        }
	    }); 
	};
	
	return {
        'GetBIMComponentInfo': getBIMComponentInfo
    };
});