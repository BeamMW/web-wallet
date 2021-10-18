import React, { useState } from 'react';

import { Button, Window } from 'app/uikit';
import { View, setView } from '@app/model/view';
import { $logs } from './model';
import { useStore } from 'effector-react';
import { styled } from '@linaria/react';
import { SaveIcon } from '@app/icons';

const ReportStyled = styled.div`
    margin-bottom: 30px;

    p {
        margin: 0;
        text-align: start;
        font-size: 16px;
        line-height: 1.25;
    }
`;

const LinkStyled = styled.span`
    cursor: pointer;
    color: #00f6d2;
    margin 0 3px;
`;

const SettingsReport = () => {
    const logs = useStore($logs);

  const handlePrevious: React.MouseEventHandler = () => {
    setView(View.SETTINGS);
  };

  const mailClicked = () => {
    const mailText = 'mailto:support@beam.mw';
    window.location.href = mailText;
  }

  const githubClicked = () => {
    window.open('https://github.com/BeamMW/web-wallet/issues', '_blank');
  }

  const saveLogsclicked = () => {
    const element = document.createElement("a");
    const common = logs.common.map(i => i + '\n');
    const errors = logs.errors.map(i => i + '\n');
    const warns = logs.warns.map(i => i + '\n');
    let finalLogs = common.concat(errors);
    finalLogs.concat(warns);
    const file = new Blob(finalLogs, {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "beam-web-wallet.log";
    document.body.appendChild(element);
    element.click();
    element.remove();
    setView(View.SETTINGS);
  }

  return (
    <Window title="Report a problem" onPrevious={handlePrevious}>
      <ReportStyled>
        <p>To report a problem:</p>
        <p>1. Click “Save wallet logs” and choose</p>
        <p>a destination folder for log archive.</p>
        <p>2. Send email to 
            <LinkStyled onClick={() => mailClicked()}>support@beam.mw</LinkStyled> 
            or open a ticket in 
            <LinkStyled onClick={() => githubClicked()}>Github</LinkStyled>.</p>
        <p>3. Don’t forget to attach logs archive.</p>
      </ReportStyled>
      <Button
          type="button"
          icon={SaveIcon}
          onClick={() => saveLogsclicked()}
        >
          save wallet logs
        </Button>
    </Window>
  );
};

export default SettingsReport;
