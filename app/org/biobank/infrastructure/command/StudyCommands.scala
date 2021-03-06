package org.biobank.infrastructure.command

import org.biobank.domain.AnnotationValueType._
import org.biobank.infrastructure._
import play.api.libs.json.Reads._
import play.api.libs.json._

object StudyCommands {
  import org.biobank.infrastructure.command.Commands._

  // study commands
  trait StudyCommand extends Command with HasOptionalUserId

  trait StudyModifyCommand extends StudyCommand with HasIdentity with HasExpectedVersion

  trait StudyCommandWithStudyId extends StudyCommand with HasStudyIdentity

  trait StudyModifyCommandWithStudyId
      extends StudyCommand
      with HasStudyIdentity
      with HasIdentity
      with HasExpectedVersion

  case class AddStudyCmd(userId:      Option[String],
                         name:        String,
                         description: Option[String])
      extends StudyCommand

  case class UpdateStudyNameCmd(userId:          Option[String],
                                id:              String,
                                expectedVersion: Long,
                                name:            String)
      extends StudyModifyCommand

  case class UpdateStudyDescriptionCmd(userId:          Option[String],
                                       id:              String,
                                       expectedVersion: Long,
                                       description:     Option[String])
      extends StudyModifyCommand

  case class StudyAddParticipantAnnotationTypeCmd(userId:          Option[String],
                                                  id:              String,
                                                  expectedVersion: Long,
                                                  name:            String,
                                                  description:     Option[String],
                                                  valueType:       AnnotationValueType,
                                                  maxValueCount:   Option[Int],
                                                  options:         Seq[String],
                                                  required:        Boolean)
      extends StudyModifyCommand

  case class StudyUpdateParticipantAnnotationTypeCmd(userId:          Option[String],
                                                     id:              String,
                                                     uniqueId:        String,
                                                     expectedVersion: Long,
                                                     name:            String,
                                                     description:     Option[String],
                                                     valueType:       AnnotationValueType,
                                                     maxValueCount:   Option[Int],
                                                     options:         Seq[String],
                                                     required:        Boolean)
      extends StudyModifyCommand

  case class UpdateStudyRemoveAnnotationTypeCmd(userId:          Option[String],
                                                id:              String,
                                                expectedVersion: Long,
                                                uniqueId:        String)
      extends StudyModifyCommand

  case class EnableStudyCmd(userId:          Option[String],
                            id:              String,
                            expectedVersion: Long)
      extends StudyModifyCommand

  case class DisableStudyCmd(userId:    Option[String],
                             id:              String,
                             expectedVersion: Long)
      extends StudyModifyCommand

  case class RetireStudyCmd(userId:    Option[String],
                            id: String,
                            expectedVersion: Long)
      extends StudyModifyCommand

  case class UnretireStudyCmd(userId:    Option[String],
                              id: String,
                              expectedVersion: Long)
      extends StudyModifyCommand


  // study annotation type commands
  trait StudyAnnotationTypeCommand extends StudyCommandWithStudyId

  trait StudyAnnotationTypeModifyCommand
      extends StudyCommandWithStudyId
      with HasIdentity
      with HasExpectedVersion

  // specimen link annotation type
  case class AddSpecimenLinkAnnotationTypeCmd(
    userId:    Option[String],
    studyId:       String,
    name:          String,
    description:   Option[String],
    valueType:     AnnotationValueType,
    maxValueCount: Option[Int] = None,
    options:       Seq[String],
    required:      Boolean)
      extends StudyAnnotationTypeCommand

  case class UpdateSpecimenLinkAnnotationTypeCmd(
    userId:    Option[String],
    studyId:         String,
    id:              String,
    expectedVersion: Long,
    name:            String,
    description:     Option[String],
    valueType:       AnnotationValueType,
    maxValueCount:   Option[Int],
    options:         Seq[String],
    required:      Boolean)
      extends StudyAnnotationTypeModifyCommand

  case class RemoveSpecimenLinkAnnotationTypeCmd(
    userId:    Option[String],
    id:              String,
    expectedVersion: Long)

  // processing type commands
  trait ProcessingTypeCommand extends StudyCommandWithStudyId

  trait ProcessingTypeModifyCommand
      extends ProcessingTypeCommand
      with HasIdentity
      with HasExpectedVersion

  case class AddProcessingTypeCmd(
    userId:    Option[String],
    studyId:     String,
    name:        String,
    description: Option[String],
    enabled:     Boolean)
      extends ProcessingTypeCommand

  case class UpdateProcessingTypeCmd(
    userId:    Option[String],
    studyId:         String,
    id:              String,
    expectedVersion: Long,
    name:            String,
    description:     Option[String],
    enabled:         Boolean)
      extends ProcessingTypeModifyCommand

  case class RemoveProcessingTypeCmd(
    userId:    Option[String],
    studyId:         String,
    id:              String,
    expectedVersion: Long)
      extends ProcessingTypeModifyCommand

  // specimen link type commands
  trait SpecimenLinkTypeCommand extends StudyCommand {

    /** the id of the processing type the specimen link type belongs to. */
    val processingTypeId: String
  }

  trait SpecimenLinkTypeModifyCommand
      extends SpecimenLinkTypeCommand
      with HasIdentity
      with HasExpectedVersion

  case class AddSpecimenLinkTypeCmd(
    userId:    Option[String],
    processingTypeId:      String,
    expectedInputChange:   BigDecimal,
    expectedOutputChange:  BigDecimal,
    inputCount:            Int,
    outputCount:           Int,
    inputGroupId:          String,
    outputGroupId:         String,
    inputContainerTypeId:  Option[String],
    outputContainerTypeId: Option[String],
    annotationTypeData:    List[SpecimenLinkTypeAnnotationTypeData])
      extends SpecimenLinkTypeCommand

  case class UpdateSpecimenLinkTypeCmd(
    userId:    Option[String],
    processingTypeId:      String,
    id:                    String,
    expectedVersion:       Long,
    expectedInputChange:   BigDecimal,
    expectedOutputChange:  BigDecimal,
    inputCount:            Int,
    outputCount:           Int,
    inputGroupId:          String,
    outputGroupId:         String,
    inputContainerTypeId:  Option[String],
    outputContainerTypeId: Option[String],
    annotationTypeData:    List[SpecimenLinkTypeAnnotationTypeData])
      extends SpecimenLinkTypeModifyCommand

  case class RemoveSpecimenLinkTypeCmd(
    userId:    Option[String],
    processingTypeId: String,
    id: String,
    expectedVersion: Long)
      extends SpecimenLinkTypeModifyCommand

  //--

  implicit val addStudyCmdReads = Json.reads[AddStudyCmd]
  implicit val updateStudyNameCmdReads = Json.reads[UpdateStudyNameCmd]
  implicit val updateStudyDescriptionCmdReads = Json.reads[UpdateStudyDescriptionCmd]
  implicit val studyAddParticipantAnnotationTypeCmdReads = Json.reads[StudyAddParticipantAnnotationTypeCmd]
  implicit val studyUpdateParticipantAnnotationTypeCmdReads = Json.reads[StudyUpdateParticipantAnnotationTypeCmd]
  implicit val updateStudyRemoveAnnotationTypeCmdReads = Json.reads[UpdateStudyRemoveAnnotationTypeCmd]
  implicit val enableStudyCmdReads = Json.reads[EnableStudyCmd]
  implicit val disableStudyCmdReads = Json.reads[DisableStudyCmd]
  implicit val retireStudyCmdReads = Json.reads[RetireStudyCmd]
  implicit val unretireStudyCmdReads = Json.reads[UnretireStudyCmd]

  implicit val addProcessingTypeCmdReads = Json.reads[AddProcessingTypeCmd]
  implicit val updateProcessingTypeCmdReads = Json.reads[UpdateProcessingTypeCmd]
  implicit val removeProcessingTypeCmdReads = Json.reads[RemoveProcessingTypeCmd]
  implicit val addSpecimenLinkAnnotationTypeCmdReads = Json.reads[AddSpecimenLinkAnnotationTypeCmd]
  implicit val updateSpecimenLinkAnnotationTypeCmdReads = Json.reads[UpdateSpecimenLinkAnnotationTypeCmd]
  implicit val removeSpecimenLinkAnnotationTypeCmdReads = Json.reads[RemoveSpecimenLinkAnnotationTypeCmd]
  implicit val addSpecimenLinkTypeCmdReads = Json.reads[AddSpecimenLinkTypeCmd]
  implicit val updateSpecimenLinkTypeCmdReads = Json.reads[UpdateSpecimenLinkTypeCmd]
  implicit val removeSpecimenLinkTypeCmdReads = Json.reads[RemoveSpecimenLinkTypeCmd]
}
