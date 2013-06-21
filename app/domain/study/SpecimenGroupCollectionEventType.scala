package domain.study

import domain._

/**
 * This is a value object.
 */
case class SpecimenGroupCollectionEventType(
  id: String,
  specimenGroupId: SpecimenGroupId,
  collectionEventTypeId: CollectionEventTypeId,
  count: Int,
  amount: BigDecimal) extends IdentifiedValueObject[String] {
}
