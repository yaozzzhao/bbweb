package org.biobank.domain

import org.biobank.domain.study.{
  CollectionEventAnnotationTypeRepositoryComponent,
  CollectionEventAnnotationTypeRepositoryComponentImpl,
  CollectionEventTypeRepositoryComponent,
  CollectionEventTypeRepositoryComponentImpl,
  ParticipantAnnotationTypeRepositoryComponent,
  ParticipantAnnotationTypeRepositoryComponentImpl,
  ProcessingTypeRepositoryComponent,
  ProcessingTypeRepositoryComponentImpl,
  StudyRepositoryComponent,
  StudyRepositoryComponentImpl,
  SpecimenGroupRepositoryComponent,
  SpecimenGroupRepositoryComponentImpl,
  SpecimenLinkAnnotationTypeRepositoryComponent,
  SpecimenLinkAnnotationTypeRepositoryComponentImpl,
  SpecimenLinkTypeRepositoryComponent,
  SpecimenLinkTypeRepositoryComponentImpl
}

trait RepositoryComponent
    extends StudyRepositoryComponent
    with SpecimenGroupRepositoryComponent
    with CollectionEventAnnotationTypeRepositoryComponent
    with CollectionEventTypeRepositoryComponent
    with ParticipantAnnotationTypeRepositoryComponent
    with ProcessingTypeRepositoryComponent
    with SpecimenLinkAnnotationTypeRepositoryComponent
    with SpecimenLinkTypeRepositoryComponent
    with UserRepositoryComponent

trait RepositoryComponentImpl
    extends RepositoryComponent
    with StudyRepositoryComponentImpl
    with SpecimenGroupRepositoryComponentImpl
    with CollectionEventAnnotationTypeRepositoryComponentImpl
    with CollectionEventTypeRepositoryComponentImpl
    with ParticipantAnnotationTypeRepositoryComponentImpl
    with ProcessingTypeRepositoryComponentImpl
    with SpecimenLinkAnnotationTypeRepositoryComponentImpl
    with SpecimenLinkTypeRepositoryComponentImpl
    with UserRepositoryComponentImpl
