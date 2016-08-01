package org.biobank.service.participants

import akka.actor._
import akka.pattern.ask
import akka.util.Timeout
import com.google.inject.ImplementedBy
import javax.inject.{Inject, Named}
import org.biobank.domain.centre.CentreRepository
import org.biobank.domain.participants._
import org.biobank.domain.study._
import org.biobank.dto.SpecimenDto
import org.biobank.infrastructure.command.SpecimenCommands._
import org.biobank.infrastructure.event.SpecimenEvents._
import org.biobank.infrastructure.{ SortOrder, AscendingOrder }
import org.biobank.service.{ServiceError, ServiceValidation}
import org.slf4j.LoggerFactory
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import scala.concurrent._
import scala.concurrent.duration._
import scalaz.Scalaz._
import scalaz.Validation.FlatMap._

@ImplementedBy(classOf[SpecimensServiceImpl])
trait SpecimensService {

  def get(specimenId: String): ServiceValidation[Specimen]

  def getByInventoryId(inventoryId: String): ServiceValidation[Specimen]

  def list(collectionEventId: String,
           sortFunc:          (Specimen, Specimen) => Boolean,
           order:             SortOrder)
      : ServiceValidation[Seq[SpecimenDto]]

  def processCommand(cmd: SpecimenCommand): Future[ServiceValidation[CollectionEvent]]

  def processRemoveCommand(cmd: SpecimenCommand): Future[ServiceValidation[Boolean]]

}

class SpecimensServiceImpl @Inject() (
  @Named("specimensProcessor") val processor: ActorRef,
  val studyRepository:                        StudyRepository,
  val collectionEventRepository:              CollectionEventRepository,
  val collectionEventTypeRepository:          CollectionEventTypeRepository,
  val ceventSpecimenRepository:               CeventSpecimenRepository,
  val specimenRepository:                     SpecimenRepository,
  val centreRepository:                       CentreRepository)
    extends SpecimensService {

  val log = LoggerFactory.getLogger(this.getClass)

  implicit val timeout: Timeout = 5.seconds

  private def convertToDto(collectionEventId: CollectionEventId,
                           ceventTypeId: CollectionEventTypeId,
                           specimen: Specimen)
      : ServiceValidation[SpecimenDto] = {
    for {
      ceventType         <- collectionEventTypeRepository.getByKey(ceventTypeId)
      specimenSpec       <- ceventType.specimenSpec(specimen.specimenSpecId)
      originCentre       <- centreRepository.getByLocationId(specimen.originLocationId)
      originLocationName <- originCentre.locationName(specimen.originLocationId)
      centre             <- centreRepository.getByLocationId(specimen.locationId)
      centreLocationName <- centre.locationName(specimen.locationId)
    } yield SpecimenDto(id                 = specimen.id.id,
                        inventoryId        = specimen.inventoryId,
                        collectionEventId  = collectionEventId.id,
                        specimenSpecId     = specimen.specimenSpecId,
                        specimenSpecName   = specimenSpec.name,
                        version            = specimen.version,
                        timeAdded          = specimen.timeAdded,
                        timeModified       = specimen.timeModified,
                        originLocationId   = specimen.originLocationId,
                        originLocationName = originLocationName,
                        locationId         = specimen.locationId,
                        locationName       = centreLocationName,
                        containerId        = specimen.containerId.map(_.id),
                        positionId         = specimen.positionId.map(_.id),
                        timeCreated        = specimen.timeCreated,
                        amount             = specimen.amount,
                        units              = specimenSpec.units,
                        status             = specimen.getClass.getSimpleName)
  }

  def get(specimenId: String): ServiceValidation[Specimen] = {
    specimenRepository.getByKey(SpecimenId(specimenId)).leftMap(_ =>
      ServiceError(s"specimen id is invalid: $specimenId")).toValidationNel
  }

  def getByInventoryId(inventoryId: String): ServiceValidation[Specimen] = {
    specimenRepository.getByInventoryId(inventoryId)
  }

  def list(collectionEventId: String,
           sortFunc:          (Specimen, Specimen) => Boolean,
           order:             SortOrder)
      : ServiceValidation[Seq[SpecimenDto]] = {

    def getSpecimens(ceventId: CollectionEventId): ServiceValidation[List[Specimen]] = {
      ceventSpecimenRepository.withCeventId(ceventId)
        .map { cs => specimenRepository.getByKey(cs.specimenId) }
        .toList
        .sequenceU
        .map { list => {
                val result = list.sortWith(sortFunc)
                if (order == AscendingOrder) result else result.reverse
              }
      }
    }

    validCevent(collectionEventId) { cevent =>
      getSpecimens(cevent.id).flatMap { specimens =>
        specimens.map { s => convertToDto(cevent.id, cevent.collectionEventTypeId, s) }.sequenceU
      }
    }
  }

  def processCommand(cmd: SpecimenCommand): Future[ServiceValidation[CollectionEvent]] =
    ask(processor, cmd).mapTo[ServiceValidation[SpecimenEvent]].map { validation =>
      for {
        event  <- validation
        cevent <- collectionEventRepository.getByKey(CollectionEventId(event.getAdded.getCollectionEventId))
      } yield cevent
    }

  def processRemoveCommand(cmd: SpecimenCommand): Future[ServiceValidation[Boolean]] =
    ask(processor, cmd).mapTo[ServiceValidation[SpecimenEvent]].map { validation =>
      for {
        event  <- validation
        result <- true.successNel[String]
      } yield result
    }

  private def validCevent[T](ceventId: String)(fn: CollectionEvent => ServiceValidation[T])
      : ServiceValidation[T] = {
    for {
      cevent <- collectionEventRepository.getByKey(CollectionEventId(ceventId))
      result <- fn(cevent)
    } yield result
  }

}
