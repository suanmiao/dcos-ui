#!/usr/bin/env groovy

@Library('sec_ci_libs@ic/dcos-ui-flavor') _

def branches = ["orlandohohmeier/feat/DCOS-12802-introduce-jenkinsfile",] as String[]

node('dcos-ui') {
  checkout scm
  withEnv(['JENKINS_VERSION=yes', 'NODE_PATH=node_modules']) {

    //
    // Do not accept triggers from unauthorised sources
    //
    //    stage('Verify Author') {
    //      user_is_authorized(branches)
    //    }

    //
    // During the initialize step we prepare the environment so we
    //
    stage('Initialize') {
      withCredentials(
        [
          usernamePassword(
            credentialsId: 'docker-hub-credentials',
            passwordVariable: 'DH_PASSWORD',
            usernameVariable: 'DH_USERNAME'
          )
        ]
      ) {
        ansiColor('xterm') {
          echo 'Setting-up environment...'

          // Install core things that won't fail
          sh '''bash ./scripts/pre-install'''

          // Install might fail with 'unexpected eof'
          retry(2) {
            sh '''npm --unsafe-perm install'''
          }

          // Install npm dependencies
          sh '''npm run scaffold'''
        }
      }
    }

    //
    // Run unit tests & build the project
    //
    stage('Lint, Unit Tests & Build') {
      parallel lint: {
        echo 'Running Lint...'
        ansiColor('xterm') {
          sh '''npm run lint'''
        }
      }, test: {
        echo 'Running Unit Tests...'
        ansiColor('xterm') {
          sh '''npm run test -- --coverage'''
        }
      }, build: {
        echo 'Building DC/OS UI...'
        ansiColor('xterm') {
          sh '''npm run build-assets'''
        }
      }, failFast: true

      archiveArtifacts 'jest/**/*'
      archiveArtifacts 'coverage/**/*'
      junit 'jest/test-results/*.xml'
      step([$class: 'CoberturaPublisher', autoUpdateHealth: false, autoUpdateStability: false, coberturaReportFile: 'coverage/cobertura-coverage.xml', failUnhealthy: false, failUnstable: false, maxNumberOfBuilds: 0, onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false])
      stash includes: 'dist/*', name: 'dist'
    }

    //
    // Run integration tests
    //
    stage('Integration Tests') {
      echo 'Running Integration Tests...'
      unstash 'dist'

      // Run a simple webserver serving the dist folder statically
      // before we run the cypress tests
      writeFile file: 'integration-tests.sh', text: [
        'export PATH=`pwd`/node_modules/.bin:$PATH',
        'http-server -p 4200 dist&',
        'SERVER_PID=$!',
        'cypress run --reporter junit --reporter-options \"mochaFile=cypress/results.xml\"',
        'RET=$?',
        'kill $SERVER_PID',
        'exit $RET'
      ].join('\n')

      ansiColor('xterm') {
        retry(2) {
          sh '''bash integration-tests.sh'''
        }
      }

      archiveArtifacts 'cypress/**/*'
      junit 'cypress/*.xml'
    }

  }
}
