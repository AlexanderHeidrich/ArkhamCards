import { t } from 'ttag';
import React, { useCallback } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { dissonantVoicesLogin, dissonantVoicesLogout } from '@actions';
import { AppState } from '@reducers';
import DeckCheckboxButton from '@components/deck/controls/DeckCheckboxButton';

interface Props {
  last?: boolean;
}

export default function DissonantVoicesLoginButton({ last }: Props) {
  const dispatch = useDispatch();
  const loading = useSelector((state: AppState) => state.dissonantVoices.loading);
  const signedIn = useSelector((state: AppState) => state.dissonantVoices.status);
  const doLogin = useCallback(() => {
    dispatch(dissonantVoicesLogin());
  }, [dispatch]);
  const logOutPressed = useCallback(() => {
    dispatch(dissonantVoicesLogout());
  }, [dispatch]);
  const loginPressed = useCallback(() => {
    Alert.alert(
      t`Sign in to Dissonant Voices?`,
      t`Dissonant Voices is an ongoing project by Mythos Busters to narrate the english scenario text for each Arkham Horror campaign.`,
      [
        { text: t`Sign In`, onPress: doLogin },
        { text: t`Cancel`, style: 'cancel' },
      ],
    );
  }, [doLogin]);
  return (
    <DeckCheckboxButton
      icon="mythos-busters"
      title={t`Dissonant Voices`}
      loading={loading}
      value={signedIn}
      onValueChange={signedIn ? logOutPressed : loginPressed}
      last={last}
    />
  );
}
