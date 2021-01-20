import React, { useCallback, useContext } from 'react';

import InvestigatorRow from '@components/core/InvestigatorRow';
import { Deck, DeckId } from '@actions/types';
import Card from '@data/Card';
import { useDeck, useInvestigatorCards } from '@components/core/hooks';
import { TINY_PHONE } from '@styles/sizes';
import LanguageContext from '@lib/i18n/LanguageContext';

interface Props {
  id: DeckId;
  deckRemoved?: (
    id: DeckId,
    deck?: Deck,
    investigator?: Card
  ) => void;
}

export default function InvestigatorDeckRow({ id, deckRemoved }: Props) {
  const { lang } = useContext(LanguageContext);
  const [theDeck] = useDeck(id, { fetchIfMissing: true });
  const investigators = useInvestigatorCards(theDeck?.taboo_id || 0);
  const investigator = theDeck && investigators && investigators[theDeck.investigator_code];
  const onRemove = useCallback(() => {
    deckRemoved && deckRemoved(id, theDeck, investigator);
  }, [
    deckRemoved,
    id,
    theDeck,
    investigator,
  ]);
  if (!theDeck || !investigator) {
    return null;
  }
  return (
    <InvestigatorRow
      investigator={investigator}
      onRemove={deckRemoved ? onRemove : undefined}
      noFactionIcon={TINY_PHONE || lang !== 'en'}
    />
  );
}