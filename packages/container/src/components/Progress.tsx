import React from 'react';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    bar: {
      width: '100%',
      '& > * + *': {
        marginTop: theme.spacing(2),
      },
    },
  });
});

const Progress: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.bar}>
      <LinearProgress />
    </div>
  );
};

export default Progress;
