// ～/generators/app/index.js
'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const path = require('path')
const fs = require('fs-extra')
// 5.0.0版本需要动态引入install
const _ = require('lodash')
_.extend(Generator.prototype, require('yeoman-generator/lib/actions/install'))

module.exports = class extends Generator {
  // 向用户展示交互式问题收集关键参数
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(`Welcome to the stunning ${chalk.red('generator-simple')} generator!`))

    const nameQuestions = [
      {
        type: 'input',
        name: 'name',
        message: 'Your project name:',
        default: 'my-app',
        validate: name => {
          if (!name) {
            return 'Project name cannot be empty'
          }
          if (!/\w+/.test(name)) {
            return 'Project name should only consist of 0~9, a~z, A~Z, _, .'
          }
          return true
        }
      },
      {
        type: 'confirm',
        name: 'force',
        message: 'Project already exists, wanna override?',
        when: answers => {
          const dir = this.destinationPath(answers.name)
          return fs.existsSync(dir) && fs.statSync(dir).isDirectory()
        }
      }
    ]

    const namePrompts = this.prompt(nameQuestions)
    return namePrompts.then(({ name, force }) => {
      if (force === false) {
        process.exit()
      }
      const propQuestions = [
        {
          type: 'input',
          name: 'description',
          message: 'Please input project description:',
          default: 'a vue project'
        },
        {
          type: 'input',
          name: 'author',
          message: "Author's Name:",
          default: ''
        },
        {
          type: 'input',
          name: 'email',
          message: "Author's Email:",
          default: ''
        },
        {
          type: 'list',
          name: 'license',
          message: 'License:',
          choices: ['MIT', 'GPL']
        }
      ]
      return this.prompt(propQuestions).then(answers => {
        this.answer = {
          answers: {
            ...answers,
            name,
            force,
            year: new Date().getFullYear()
          }
        }
        return this.answer
      })
    })
  }

  configuring() {
    const { name } = this.answer.answers
    const targetDir = path.join(this.destinationRoot(), name)
    this.log('\nPreparing...\n')
    fs.emptyDirSync(targetDir)
    this.destinationRoot(targetDir)
  }

  // 依据模板进行新项目结构的写操作
  writing() {
    this.log('\nWriting...\n')
    this.fs.copy(this.templatePath('.browserslistrc'), this.destinationPath('.browserslistrc'))
    this.fs.copy(this.templatePath('.eslintrc.js'), this.destinationPath('.eslintrc.js'))
    this.fs.copy(this.templatePath('.gitignore'), this.destinationPath('.gitignore'))
    this.fs.copy(this.templatePath('.prettierrc'), this.destinationPath('.prettierrc'))
    this.fs.copy(this.templatePath('babel.config.js'), this.destinationPath('babel.config.js'))
    this.fs.copyTpl(this.templatePath('package.json.vm'), this.destinationPath('package.json'), this.answer)
    this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), this.answer)
    this.fs.copyTpl(this.templatePath('public'), this.destinationPath('public'), this.answer)
    this.fs.copyTpl(this.templatePath('src'), this.destinationPath('src'), this.answer)
  }

  end() {
    const { answers } = this.answer

    this.log.writeln()
    this.log.info(
      'Make sure you have vscode extension https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode installed'
    )
    this.log.writeln()

    this.log.ok(`Project 🛠 ${chalk.blue(answers.name)} generated!!!`)
  }
}
