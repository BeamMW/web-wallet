import React from 'react';

import { Button, Window } from '@app/shared/components';
import { styled } from '@linaria/react';
import * as extensionizer from 'extensionizer';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectConnectedSites } from '@app/containers/Settings/store/selectors';
import { SitesList } from '../../components';

const SitesStyled = styled.div`
  margin-bottom: 30px;
`;

const SettingsConnected = () => {
  const navigate = useNavigate();
  const sites: any = useSelector(selectConnectedSites());

  const handlePrevious: React.MouseEventHandler = () => {
    navigate(ROUTES.SETTINGS.BASE);
  };

  return (
    <Window title="Connected sites" onPrevious={handlePrevious}>
        <SitesStyled>
            <SitesList data={sites}></SitesList>
        </SitesStyled>
    </Window>
  );
};

export default SettingsConnected;
