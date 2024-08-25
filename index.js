const { App } = require('@slack/bolt')

const Client = require("@replit/database")
const database = new Client()
const SLACK_SIGNING_SECRET = process.env['SLACK_SIGNING_SECRET']
const SLACK_BOT_TOKEN = process.env['SLACK_BOT_TOKEN']
const app = new App({
    signingSecret: SLACK_SIGNING_SECRET, 
    token: SLACK_BOT_TOKEN
})

async function main () {
    await app.start(process.env.PORT || 3000)

    app.command('/todolist', async ({ command, ack, say }) => {
        await ack()

        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        let response = ""

        currentUserTodo.forEach((todo, index) => {
            response += `\n${index + 1}. ${todo}`
        })

        if (response) {
            await say("Your todo list:" + response)
        } else {
            await say(`Your todo list is currently empty!`)
        }
    })

    app.command('/todolistadd', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        currentUserTodo.push(command.text)
        await database.set(command.user_id, JSON.stringify(currentUserTodo))
        await say(`Added\n• ${command.text}\n to your todo list`)
    })

    app.command('/todolistremove', async ({ command, ack, say }) => {
        await ack()
        let currentUserTodo = JSON.parse(await database.get(command.user_id)) || []
        let removed = currentUserTodo[command.text - 1]
        currentUserTodo.splice(command.text - 1, 1)
        await database.set(command.user_id, JSON.stringify(currentUserTodo))
        await say(`Removed\n• ${removed}\n from your todo list`)
    })

    console.log('⚡️ Server ready')
    console.log('SLACK_SIGNING_SECRET:', SLACK_SIGNING_SECRET);
    console.log('SLACK_BOT_TOKEN:', SLACK_BOT_TOKEN);
    app.use(async ({ logger, body }, next) => {
        logger.info(body);
        await next();
    });
}

main()