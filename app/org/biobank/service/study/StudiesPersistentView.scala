package org.biobank.service.study

import akka.persistence.PersistentView
import akka.actor.ActorLogging
import akka.actor.Actor

class StudiesPersistentView extends PersistentView with ActorLogging {

  override def persistenceId: String = "study-processor-id"

  override def viewId: String = "study-persistence-id-view"

  def receive: Actor.Receive = {
    case payload if isPersistent =>
      // handle message from journal...
      log.info(s"$payload")

    case payload                 =>
      // handle message from user-land...
  }
}
