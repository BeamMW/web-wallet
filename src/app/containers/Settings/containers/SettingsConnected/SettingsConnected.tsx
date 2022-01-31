import React from 'react';

import { Window } from '@app/shared/components';
import { styled } from '@linaria/react';

import { ROUTES } from '@app/shared/constants';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectConnectedSites } from '@app/containers/Settings/store/selectors';
import { SitesList } from '../../components';

const SitesStyled = styled.div`
  margin-bottom: 30px;
`;

const ListEmptyStyled = styled.div`
  margin-top: 100px;
  opacity: 0.6;
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
        {sites.length > 0 ? (
          <SitesList data={sites} />
        ) : (
          <ListEmptyStyled>Your connected sites list is empty</ListEmptyStyled>
        )}
      </SitesStyled>
    </Window>
  );
};

export default SettingsConnected;
