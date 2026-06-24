type ParticipantPair = {
  participantAId: string;
  participantBId: string;
};

export function normalizeParticipants(currentUserId: string, otherUserId: string): ParticipantPair {
  const [participantAId, participantBId] = [currentUserId, otherUserId].sort();
  return { participantAId, participantBId };
}

export function getOtherParticipantId(
  conversation: ParticipantPair,
  currentUserId: string,
) {
  return conversation.participantAId === currentUserId
    ? conversation.participantBId
    : conversation.participantAId;
}
