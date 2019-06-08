module.exports = {
  apps : [
    {
      name: "logistic",
      script: "./index.js",
      args : "prod",
      watch: true,
      ignore_watch: [
        './.git',
        './.idea',
        './uploads',
        './apiary.apib', //Автоматически генерирует документацию
        './node_modules'
      ]
    }
  ]
};
