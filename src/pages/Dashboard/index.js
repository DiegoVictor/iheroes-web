import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import {
  Form as Frm,
  Table,
  OverlayTrigger,
  Popover,
  Badge,
  Button,
  Row,
  Col,
  ButtonGroup,
} from 'react-bootstrap';
import { Form } from '@unform/web';
import { Link } from 'react-router-dom';

import NotificationsContext from '~/contexts/Notifications';
import UserContext from '~/contexts/User';
import api from '~/services/api';
import { Input } from '~/components/Input';
import { Modal } from '~/components/Modal';
import { Select } from '~/components/Select';
import { Container } from './styles';

async function getFightingMonsters() {
  const { data } = await api.get('monsters', {
    params: {
      status: 'fighting',
    },
  });

  return data;
}

async function getDefeatedMonsters() {
  const { data } = await api.get('monsters', {
    params: {
      status: 'defeated',
    },
  });

  return data;
}

export function Dashboard() {
  const googleMapUrl = useMemo(() => '//www.google.com.br/maps/place/', []);
  const { token } = useContext(UserContext);
  const [monster, setMonster] = useState(null);
  const [monsters, setMonsters] = useState([]);
  const [history, setHistory] = useState([]);

  const reList = useCallback(async (key) => {
    switch (key) {
      case 'fighting': {
        return getFightingMonsters().then(setMonsters);
      }

      case 'defeated': {
        return getDefeatedMonsters().then(setHistory);
      }

      default: {
        return Promise.all([
          getFightingMonsters().then(setMonsters),
          getDefeatedMonsters().then(setHistory),
        ]);
      }
    }
  }, []);

  const handleMonsterDefeated = useCallback(
    async ({ monsterId, heroes }) => {
        try {
        await api.put(`/monsters/${monsterId}/defeated`, { heroes });

        reList();
        } catch (err) {
        alert('Não foi possivel atualizar o status da ameaça!');
        }

      setFormData(null);
    },
    [reList]
  );

  useEffect(() => {
    reList('fighting').finally(() => {
      setInterval(() => reList('fighting'), 60 * 1000);
    });
    reList('defeated');
  });

  return (
    <Container>
      <h5 className="d-flex align-items-center">
        Combatendo{' '}
        <Badge className="ml-1" variant="primary">
          {monsters.length}
        </Badge>
      </h5>
      <FightingTable monsters={monsters} setFormData={setFormData} />

      <h5 className="d-flex mt-5 align-items-center">
        Combatidos
        <Badge className="ml-1" variant="primary">
          {history.length}
        </Badge>
      </h5>
      <DefeatedTable monsters={defeated} />

      <FormModal
        formData={formData}
        handleMonsterDefeated={handleMonsterDefeated}
        onHide={() => setFormData(null)}
      />
    </Container>
  );
}
