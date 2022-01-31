import React from 'react';
import { styled } from '@linaria/react';
import { ExternalAppConnection } from '@core/types';
import { Button } from '@app/shared/components';
import { RemoveIcon } from '@app/shared/icons';
// import { disconnectSite } from '@core/api';
import { disconnectAllowedSite } from '@app/containers/Settings/store/actions';
import { useDispatch } from 'react-redux';

const ListStyled = styled.ul`
  margin: 0 -20px;
`;

interface SitesProps {
  data: ExternalAppConnection[];
}

const ListItemStyled = styled.li`
  position: relative;
  padding: 20px;
  text-align: start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  &:nth-child(odd) {
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const UrlItemStyled = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const SitesList: React.FC<SitesProps> = ({ data: sites }) => {
  const dispatch = useDispatch();

  const handleRemoveSite = (site) => {
    dispatch(disconnectAllowedSite.request(site));
  };

  return sites.length ? (
    <ListStyled>
      {sites.map((site) => (
        <ListItemStyled key={site.appName}>
          <span>
            <div>{site.appName}</div>
            <UrlItemStyled>{site.appUrl}</UrlItemStyled>
          </span>
          <Button variant="icon" icon={RemoveIcon} pallete="ghost" onClick={() => handleRemoveSite(site)} />
        </ListItemStyled>
      ))}
    </ListStyled>
  ) : (
    <></>
  );
};

export default SitesList;
