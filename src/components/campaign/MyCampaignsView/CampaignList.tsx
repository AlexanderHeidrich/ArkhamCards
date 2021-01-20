import React, { useCallback, useContext, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, Keyboard, Platform, View, StyleSheet, RefreshControl } from 'react-native';
import { map } from 'lodash';
import { Navigation, Options } from 'react-native-navigation';
import { t } from 'ttag';

import { Campaign, getCampaignId, STANDALONE } from '@actions/types';
import { iconsMap } from '@app/NavIcons';
import CampaignItem from './CampaignItem';
import { CampaignDetailProps } from '@components/campaign/CampaignDetailView';
import { CampaignGuideProps } from '@components/campaignguide/CampaignGuideView';
import { StandaloneGuideProps } from '@components/campaignguide/StandaloneGuideView';
import { LinkedCampaignGuideProps } from '@components/campaignguide/LinkedCampaignGuideView';
import LinkedCampaignItem from './LinkedCampaignItem';
import COLORS from '@styles/colors';
import { SEARCH_BAR_HEIGHT } from '@components/core/SearchBox';
import StandaloneItem from './StandaloneItem';
import StyleContext from '@styles/StyleContext';

interface Props {
  onScroll: (...args: any[]) => void;
  componentId: string;
  campaigns: Campaign[];
  footer: React.ReactElement;
  standalonesById: { [campaignId: string]: { [scenarioId: string]: string } };
  onRefresh?: () => void;
  refreshing?: boolean;
}

interface CampaignItemType {
  campaign: Campaign;
}

export default function CampaignList({ onScroll, componentId, campaigns, footer, standalonesById, onRefresh, refreshing }: Props) {
  const { colors } = useContext(StyleContext);
  const onPress = useCallback((id: string, campaign: Campaign) => {
    Keyboard.dismiss();
    const options: Options = {
      topBar: {
        title: {
          text: campaign.name,
        },
        backButton: {
          title: t`Back`,
        },
        rightButtons: [
          {
            icon: iconsMap.edit,
            id: 'edit',
            color: COLORS.M,
            accessibilityLabel: t`Edit name`,
          },
        ],
      },
    };
    if (campaign.cycleCode === STANDALONE) {
      if (campaign.standaloneId) {
        Navigation.push<StandaloneGuideProps>(componentId, {
          component: {
            name: 'Guide.Standalone',
            passProps: {
              campaignId: getCampaignId(campaign),
              standaloneId: campaign.standaloneId,
            },
            options,
          },
        });
      }
    } else if (campaign.guided) {
      if (campaign.linkUuid) {
        Navigation.push<LinkedCampaignGuideProps>(componentId, {
          component: {
            name: 'Guide.LinkedCampaign',
            passProps: {
              campaignId: campaign.uuid,
              campaignIdA: campaign.linkUuid.campaignIdA,
              campaignIdB: campaign.linkUuid.campaignIdB,
            },
            options,
          },
        });
      } else {
        Navigation.push<CampaignGuideProps>(componentId, {
          component: {
            name: 'Guide.Campaign',
            passProps: {
              campaignId: campaign.uuid,
            },
            options,
          },
        });
      }
    } else {
      Navigation.push<CampaignDetailProps>(componentId, {
        component: {
          name: 'Campaign',
          passProps: {
            id,
          },
          options,
        },
      });
    }
  }, [componentId]);

  const renderItem = useCallback(({ item: { campaign } }: ListRenderItemInfo<CampaignItemType>) => {
    if (campaign.cycleCode === STANDALONE) {
      return campaign.standaloneId ? (
        <StandaloneItem
          key={campaign.uuid}
          campaign={campaign}
          onPress={onPress}
          scenarioName={standalonesById[campaign.standaloneId.campaignId][campaign.standaloneId.scenarioId]}
        />
      ) : null;
    }
    if (campaign.linkUuid) {
      return (
        <LinkedCampaignItem
          key={campaign.uuid}
          campaign={campaign}
          onPress={onPress}
        />
      );
    }
    return (
      <CampaignItem
        key={campaign.uuid}
        campaign={campaign}
        onPress={onPress}
      />
    );
  }, [onPress, standalonesById]);

  const header = useMemo(() => {
    if (Platform.OS === 'android') {
      return (
        <View style={styles.searchBarPadding} />
      );
    }
    return null;
  }, []);

  return (
    <FlatList
      contentInset={Platform.OS === 'ios' ? { top: SEARCH_BAR_HEIGHT } : undefined}
      contentOffset={Platform.OS === 'ios' ? { x: 0, y: -SEARCH_BAR_HEIGHT } : undefined}
      refreshControl={onRefresh ? (
        <RefreshControl
          refreshing={!!refreshing}
          onRefresh={onRefresh}
          tintColor={colors.lightText}
          progressViewOffset={SEARCH_BAR_HEIGHT}
        />
      ) : undefined}
      onScroll={onScroll}
      data={map(campaigns, campaign => {
        return {
          key: `${campaign.uuid}`,
          campaign,
        };
      })}
      renderItem={renderItem}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
    />
  );
}

const styles = StyleSheet.create({
  searchBarPadding: {
    height: SEARCH_BAR_HEIGHT,
  },
});
