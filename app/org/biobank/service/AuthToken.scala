package org.biobank.service

import org.biobank.domain.DomainValidation
import org.biobank.domain.user.UserId

import javax.inject.{ Inject, Singleton }
import com.google.inject.ImplementedBy
import play.api.cache.CacheApi
import play.api.Environment
import scala.concurrent.duration._
import scalaz.Scalaz._

/**
 *  Manages tokens used to authenticate logged in users.
 */
@ImplementedBy(classOf[AuthTokenImpl])
trait AuthToken {

  val env: Environment

  val cacheApi: CacheApi

  def newToken(userId: UserId): String

  def getUserId(token: String): DomainValidation[UserId]

}

@Singleton
class AuthTokenImpl @Inject() (val env: Environment, val cacheApi: CacheApi)
    extends AuthToken {
  import org.biobank.CommonValidations._

  val tokenExpirationTime =
    if (env.mode == play.api.Mode.Prod) 15.minutes
    else 60.minutes
    //else 5.seconds

  /**
   *  Generates a new token for userId with an expiration of tokenExpirationTime.
   *
   *  TODO: Should token be derived from salt? not sure if required if server only runs HTTPS.
   */
  def newToken(userId: UserId): String = {
    val token = java.util.UUID.randomUUID.toString.replaceAll("-","")
    cacheApi.set(token, userId, tokenExpirationTime)
    token
  }

  /**
   *  If token is valid then the timeout is re-assigned on the cache.
   */
  def getUserId(token: String): DomainValidation[UserId] = {
    val userId = cacheApi.get[UserId](token).toSuccessNel(InvalidToken.toString)
    userId map { cacheApi.set(token, _, tokenExpirationTime) }
    userId
  }

}
