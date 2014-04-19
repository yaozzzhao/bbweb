package org.biobank.domain.study

import org.biobank.domain._

import org.slf4j.LoggerFactory

import scalaz._
import Scalaz._

trait SpecimenGroupRepositoryComponent {

  val specimenGroupRepository: SpecimenGroupRepository

  trait SpecimenGroupRepository extends ReadWriteRepository[SpecimenGroupId, SpecimenGroup] {

    def nextIdentity: SpecimenGroupId

    def specimenGroupWithId(
      studyId: StudyId,
      specimenGroupId: SpecimenGroupId): DomainValidation[SpecimenGroup]

    def specimenGroupWithId(
      studyId: StudyId,
      specimenGroupId: String): DomainValidation[SpecimenGroup]

    def allSpecimenGroupsForStudy(studyId: StudyId): Set[SpecimenGroup]

    // def add(specimenGroup: SpecimenGroup): DomainValidation[SpecimenGroup]

    // def update(specimenGroup: SpecimenGroup): DomainValidation[SpecimenGroup]

    // def remove(specimenGroup: SpecimenGroup): DomainValidation[SpecimenGroup]

  }
}

trait SpecimenGroupRepositoryComponentImpl extends SpecimenGroupRepositoryComponent {

  override val specimenGroupRepository: SpecimenGroupRepository = new SpecimenGroupRepositoryImpl

  class SpecimenGroupRepositoryImpl
    extends ReadWriteRepositoryRefImpl[SpecimenGroupId, SpecimenGroup](v => v.id)
    with SpecimenGroupRepository {

    val log = LoggerFactory.getLogger(this.getClass)

    def nextIdentity: SpecimenGroupId =
      new SpecimenGroupId(java.util.UUID.randomUUID.toString.toUpperCase)

    def specimenGroupWithId(
      studyId: StudyId,
      specimenGroupId: SpecimenGroupId): DomainValidation[SpecimenGroup] = {
      getByKey(specimenGroupId) match {
        case Failure(err) =>
          DomainError("specimen group does not exist: { studyId: %s, specimenGroupId: %s }".format(
            studyId, specimenGroupId)).failNel
        case Success(sg) =>
          if (sg.studyId.equals(studyId)) sg.success
          else DomainError(
            "study does not have specimen group: { studyId: %s, specimenGroupId: %s }".format(
              studyId, specimenGroupId)).failNel
      }
    }

    def specimenGroupWithId(
      studyId: StudyId,
      specimenGroupId: String): DomainValidation[SpecimenGroup] = {
      specimenGroupWithId(studyId, SpecimenGroupId(specimenGroupId))
    }

    def allSpecimenGroupsForStudy(studyId: StudyId): Set[SpecimenGroup] = {
      getValues.filter(x => x.studyId.equals(studyId)).toSet
    }

    private def nameAvailable(specimenGroup: SpecimenGroup): DomainValidation[Boolean] = {
      val exists = getValues.exists { item =>
        item.studyId.equals(specimenGroup.studyId) &&
          item.name.equals(specimenGroup.name) &&
          !item.id.equals(specimenGroup.id)
      }

      if (exists)
        DomainError("specimen group with name already exists: %s" format specimenGroup.name).failNel
      else
        true.success
    }

    // def add(specimenGroup: SpecimenGroup): DomainValidation[SpecimenGroup] = {
    //   specimenGroupWithId(specimenGroup.studyId, specimenGroup.id) match {
    //     case Success(prevItem) =>
    //       DomainError("specimen group with ID already exists: %s" format specimenGroup.id).failNel
    //     case Failure(x) =>
    //       for {
    //         nameValid <- nameAvailable(specimenGroup)
    //         item <- put(specimenGroup).success
    //       } yield item
    //   }
    // }

    // def update(specimenGroup: SpecimenGroup): DomainValidation[SpecimenGroup] = {
    //   for {
    //     prevItem <- specimenGroupWithId(specimenGroup.studyId, specimenGroup.id)
    //     validVersion <- prevItem.requireVersion(Some(specimenGroup.version))
    //     nameValid <- nameAvailable(specimenGroup)
    //     updatedItem <- SpecimenGroup.create(
    // 	   specimenGroup.studyId, specimenGroup.id, specimenGroup.version + 1,
    //       specimenGroup.name, specimenGroup.description, specimenGroup.units,
    //       specimenGroup.anatomicalSourceType, specimenGroup.preservationType,
    //       specimenGroup.preservationTemperatureType, specimenGroup.specimenType)
    //     repoItem <- put(updatedItem).success
    //   } yield updatedItem
    // }

    // def remove(specimenGroup: SpecimenGroup): DomainValidation[SpecimenGroup] = {
    //   for {
    //     item <- specimenGroupWithId(specimenGroup.studyId, specimenGroup.id)
    //     validVersion <- item.requireVersion(Some(specimenGroup.version))
    //     removedItem <- remove(item).success
    //   } yield removedItem

    // }
  }
}
