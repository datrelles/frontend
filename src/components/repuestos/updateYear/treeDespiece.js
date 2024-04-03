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

  const findNodeLabel = (nodeId, allDataMotos) => {
    if (allDataMotos.id === nodeId) {
      return allDataMotos.name;
    }

    if (allDataMotos.children) {
      for (let child of allDataMotos.children) {
        const label = findNodeLabel(nodeId, child);
        if (label) {
          return label;
        }
      }
    }

    return null;
  }

  const updateCodeSubsistemaSelectedAux = (nodeId) => {
    setCodeSubsistemaSelected(nodeId)
    const resultName = findNodeLabel(nodeId, allDataMotos)
    const resultChildren = findChildrenById(allDataMotos, nodeId)
    const resultChildrenWithOutSubChildren = checkChildren(resultChildren)
    updateCodeSubsistemaSelected(nodeId, resultName, resultChildrenWithOutSubChildren)

  }

  function findChildrenById(node, targetId) {
    if (targetId == 'SHINERAY' || targetId == 'BULTACO' || targetId == 'SHM ELECTRICAS' || targetId == 'root') {
      const message = 'conjunto restringido'
      return message
    }

    if (node.id === targetId) {
      return node.children;
    }


    if (node.children) {
      for (let child of node.children) {
        const result = findChildrenById(child, targetId);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  const checkChildren = (items) => {
    const captureIds = [];

    if (!Array.isArray(items)) {
      return null;
    }

    for (let item of items) {
  
      if (item.children) {
        return null;
      } else {
        captureIds.push(item.id);
      }
    }

    return captureIds;
}

  return (
    <div >
      <TreeView
        className={classes.root}
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpanded={['root']}
        defaultExpandIcon={<ChevronRightIcon />}
        onNodeSelect={(event, nodeId) => updateCodeSubsistemaSelectedAux(nodeId)}
      >
        {renderTree(allDataMotos)}
      </TreeView>
    </div>
  )
}
