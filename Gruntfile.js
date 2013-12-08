module.exports = function(grunt) {
    grunt.initConfig({
	pkg:grunt.file.readJSON('package.json'),
	jshint:{
	    files:['./cache.js'],
	    options:{
		eqeqeq:true,
		curly:true,
		smarttabs:true,
		ignores:['./app.js,./Gruntfile.js']
	    }
	},
	yuidoc:{
	    compile:{
		name:'<%= pkg.name %>',
		url:'<%= pkg.homepage %>',
		options:{
		    paths:'./',
		    outdir:'build/docs'
		}
	    }
	}
    });
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');

    grunt.registerTask('default',['jshint','yuidoc']);
}
