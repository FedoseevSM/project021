import React from 'react';
import cx from 'classnames';
import { Link } from 'react-router-dom';
import s from './Page.module.scss';

interface IProps {
  title: string;
  children?: any;
  className?: string;
  link?: string;
}

const Page = ({ title = '', children = null, className, link }: IProps) => (
  <section className={cx(s.wrapper, { [className!]: !!className })}>
    <h1 className={s.title}>
      {link ? <Link to={link}>{title}</Link> : title}
    </h1>
    <section className={s.content}>{children}</section>
  </section>
);

export default Page;
