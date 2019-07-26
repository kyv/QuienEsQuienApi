def URL
def BRANCH
def CREDENTIALS

pipeline {
  agent { label 'swarm' }
  stages {
    stage ('Checkout and Clean') {
      steps {
        script {
          URL='ssh://git@gitlab.rindecuentas.org:2203/equipo-qqw/QuienEsQuienApi.git'
          BRANCH='*/master'
          CREDENTIALS='CHANGEME'
        }
          dir('new-dir') { sh 'pwd' }
          ansiColor('xterm') {
            checkout changelog: false, poll: false, scm:
            [$class:
             'GitSCM', branches: [[name: BRANCH]],
              doGenerateSubmoduleConfigurations: false,
              extensions: [],
              submoduleCfg: [],
              userRemoteConfigs:
              [[
                credentialsId: CREDENTIALS,
                url: URL
              ]]
            ]
          }
        echo "Clean container and Image"
        sh 'make clean'
      }
    }
    stage ('Build') {
      agent { label 'swarm' }
      steps {
        script {
          echo "Build container"
          sh 'make build'
        }
      }
    }
    stage ('Test') {
      agent { label 'swarm' }
      steps {
        script {
          echo "Run container"
          sh 'make test'
        }
      }
    }
    stage ('Release') {
      agent { label 'swarm' }
      steps {
        script {
          echo "Push to dockerhub registry"
          sh 'make release'
        }
      }
    }
  }
}
