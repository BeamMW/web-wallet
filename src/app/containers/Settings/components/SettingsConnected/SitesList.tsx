import React from 'react';
import { styled } from '@linaria/react';
import { ExternalAppConnection } from '@core/types';
import { Button } from '@app/shared/components';
import { RemoveIcon } from '@app/shared/icons';
// import { disconnectSite } from '@core/api';
import { disconnectAllowedSite } from '@app/containers/Settings/store/actions';
import { useDispatch } from 'react-redux';

const ListStyled = styled.ul`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface SitesProps {
  data: ExternalAppConnection[];
}

const ListItemStyled = styled.li`
  position: relative;
  padding: 13px 14px;
  text-align: start;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  clip-path: var(--cp-clip-sm);
  border: 1px solid var(--cp-hair);
  background-color: rgba(255, 255, 255, 0.015);

  span > div:first-child {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--cp-text);
  }
`;

const UrlItemStyled = styled.div`
  margin-top: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--cp-accent-3);
  word-break: break-all;
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
