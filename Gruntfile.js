module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    typescript: {
      client: {
        src: ['src-client/**/*.ts'],
        dest: 'build/client/',
        options: {
          module: 'amd', //or commonjs
          target: 'es5', //or es3
          basePath: 'src-client/',
          sourceMap: false,
          declaration: false
        }
      },
      server: {
        src: ['src-server/**/*.ts'],
        dest: 'build/server/',
        options: {
          module: 'commonjs', //or commonjs
          target: 'es5', //or es3
          basePath: 'src-server/',
          sourceMap: false,
          declaration: false
        }
      }
    },
    watch: {
      scripts: {
        files: ['src-client/**/*.ts', 'src-server/**/*.ts'],
        tasks: ['typescript'],
        options: {
          spawn: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-typescript');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['typescript']);

};