import React from 'react';
import { styled } from '@linaria/react';
import { isNil } from '@core/utils';

const STRENGTH_CRITERIA = [
  /^.{10,63}$/, // at least 10 chars
  /^(?=.*?[a-z])/, // at least 1 lower case char
  /^(?=.*?[A-Z])/, // at least 1 upper case char
  /^(?=.*?[0-9])/, //  at least 1 digit
  /^(?=.*?[" !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"])/, // at least 1 special char
];

function getStrengthTitle(value: number) {
  switch (value) {
    case 6:
      return 'Very strong';
    case 5:
      return 'Strong';
    case 3:
      return 'Medium strength';
    case 2:
      return 'Weak';
    case 1:
      return 'Very Weak';
    default:
      return null;
  }
}

function ratePassword(password: string): number {
  return STRENGTH_CRITERIA.reduce((result, regExp) => {
    const unit = regExp.test(password) ? 1 : 0;
    const bonus = result === 4 ? 1 : 0;
    return result + unit + bonus;
  }, 0);
}

interface PasswordStrengthProps {
  value: string;
}

const BARS_MAX = 6;

const ContainerStyled = styled.div`
  position: relative;
  height: 40px;
  margin: 20px 0;
`;

const ListStyled = styled.ol`
  display: flex;
  align-content: stretch;
  margin: 0 -4px;
`;

const ListItemStyled = styled.li<{ points: number }>`
  flex-grow: 1;
  height: 6px;
  margin: 0 4px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-width: ${({ points }) => (points > 0 ? 0 : 1)}px;
  background-color: ${({ points }) => {
    switch (true) {
      case points >= 5:
        return 'var(--color-green)';
      case points === 3:
        return 'var(--color-yellow)';
      case points === 0:
        return 'transparent';
      default:
        return 'var(--color-red)';
    }
  }};
`;

const StrengthTitleStyled = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
`;

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ value }) => {
  const points = ratePassword(value);
  const title = getStrengthTitle(points);
  const bars = new Array(BARS_MAX)
    .fill(null)
    .map((v, index) => (index < points ? points : 0));

  return (
    <ContainerStyled>
      <ListStyled>
        {bars.map((p, index) => (
          <ListItemStyled key={index} points={p} />
        ))}
      </ListStyled>
      {!isNil(title) && (
        <StrengthTitleStyled>
          {title}
          {' '}
          password
        </StrengthTitleStyled>
      )}
    </ContainerStyled>
  );
};

export default PasswordStrength;
