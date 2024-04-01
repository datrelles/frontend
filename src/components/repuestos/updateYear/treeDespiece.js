import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import { getDataDespiece } from '../../../services/api';
import { useAuthContext } from '../../../context/authContext';
import { ProcessData } from './processDataDespiece';
const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
    fontWeight: 400,
    fontSize: '14px'

  },
});

const data = {
  id: 'root',
  name: 'Parent',
  children: [
    {
      id: '1',
      name: 'Child - 1',
    },
    {
      id: '3',
      name: 'Child - 3',
      children: [
        {
          id: '4',
          name: 'Child - 4',
        },
      ],
    },
  ],
};


export const TreeDespiece = ({ updateCodeSubsistemaSelected }) => {
  const classes = useStyles();
  const { jwt, userShineray, enterpriseShineray, branchShineray, systemShineray } = useAuthContext()
  const [allDataMotos, setAllDataMotos] = useState([]);
  const [codeSubsistemaSelected, setCodeSubsistemaSelected] = useState('')


  useEffect(() => {
    getDataDespieceMotos(jwt, enterpriseShineray)

  }, [])

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
    </TreeItem>
  );

  const getDataDespieceMotos = async (jwt, enterpriseShineray) => {
    try {
      const response = await getDataDespiece(jwt, enterpriseShineray);
      const newDataProcess = ProcessData(response)
      setAllDataMotos(newDataProcess)

    } catch (error) {
      console.log(error)
    }
  }


  return (
    <div >
      {/* <text className='poppins-regular'>
        Seleccione 
      </text> */}

      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={(event, nodeId, label) => updateCodeSubsistemaSelected(nodeId, label)}
      >
        {renderTree(allDataMotos)}
      </TreeView>
    </div>

  )
}
