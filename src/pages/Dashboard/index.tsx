/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

import { act } from 'react-dom/test-utils';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

// import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

interface CompleteInfo {
  transactions: Transaction[];
  balance: {
    income: number;
    outcome: number;
    total: number;
  };
}

// prettier-ignore
const formatValue = (value: number): string => (Intl.NumberFormat(
  'pt-BR',
  { style: 'currency', currency: 'BRL' },
).format(value));

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const { data } = await api.get<CompleteInfo>('transactions');

      const myTransactions = data.transactions.map(
        ({ value, created_at }, index) => ({
          ...data.transactions[index],
          formattedValue: formatValue(value),
          created_at: new Date(created_at),
        }),
      );

      myTransactions.forEach(({ created_at }, index) => {
        myTransactions[index].formattedDate = `${created_at.getDate()}/${
          created_at.getMonth() + 1
        }/${created_at.getFullYear()}`;
      });

      act(() => {
        setTransactions(myTransactions);
      });

      const myBalance = {
        income: formatValue(data.balance.income),
        outcome: formatValue(data.balance.outcome),
        total: formatValue(data.balance.total),
      };

      act(() => {
        setBalance(myBalance);
      });
    }
    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {
                // prettier-ignore
                transactions.length > 0
                && transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className={transaction.type}>
                      {transaction.type === 'outcome' ? `- ${transaction.formattedValue}` : transaction.formattedValue}
                    </td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
