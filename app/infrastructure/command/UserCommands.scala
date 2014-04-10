package infrastructure.command

import infrastructure.command.Commands._

object UserCommands {

  sealed trait UserCommand extends Command

  case class AddUserCommand(
    name: String,
    email: String,
    password: String,
    hasher: String,
    salt: Option[String],
    avatarUrl: Option[String])
    extends UserCommand

}