const sgMail = require('@sendgrid/mail')


class SandGrid {
    constructor() {
        this.secreet = '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'
        this.templates = {
            registerUser: '92e87318-e04f-45bc-826e-ce023ebf6126',
            tagShare: '7b8ff916-cbc2-47fc-acc3-ba9c9407548a',
        }
        this.from = {
            email: 'noreply@qr-id.info',
            name: 'QR-ID'
        }

        sgMail.setApiKey(this.secreet)
    }

    /**
     * Отправляем письмо говорящее об успешной регистрации
     * @param to {String} - E-mail на который отправляем сообщение
     * @param password {String} - пароль пользователя
     * @param company_name {String} - Название компании
     * @param title {String} - Заготовок письма
     */
    registerUser(to, password, company_name, title = "Успешная регистрация") {
        let message = {
            from: this.from,
            to,
            subject: title,
            template_id: this.templates.registerUser,
            substitutions: {
                email: to,
                password,
                company_name
            }
        }

        sgMail.send(message)
    }

    /**
     * Отправляем письмо с ссылкой на метку
     * @param to {String} - E-mail на который отправляем сообщение
     * @param tag {String} - пароль пользователя
     * @param position_name {String} - position
     * @param message_text {String} - message
     * @param subject {String} - пароль пользователя
     */
    tagShare(to, tag, position_name, message_text, subject = "Ссылка на информацию по метке") {
        try {
            let message = {
                from: this.from,
                to,
                subject,
                template_id: this.templates.tagShare,
                substitutions: {
                    tag: tag,
                    position_name: position_name,
                    text_message: message_text
                }
            }

            sgMail.send(message)
        }catch (err) {
            console.log(err)
        }
    }
}

module.exports = new SandGrid()