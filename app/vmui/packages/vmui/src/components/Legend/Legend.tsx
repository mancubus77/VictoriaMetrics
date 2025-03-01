import React, {FC, useMemo, useState} from "preact/compat";
import {hexToRGB} from "../../utils/color";
import {useAppState} from "../../state/common/StateContext";
import {LegendItem} from "../../utils/uplot/types";
import "./legend.css";
import {getDashLine} from "../../utils/uplot/helpers";
import Tooltip from "@mui/material/Tooltip";

export interface LegendProps {
  labels: LegendItem[];
  onChange: (item: LegendItem, metaKey: boolean) => void;
}

const Legend: FC<LegendProps> = ({labels, onChange}) => {
  const {query} = useAppState();

  const [copiedValue, setCopiedValue] = useState("");

  const groups = useMemo(() => {
    return Array.from(new Set(labels.map(l => l.group)));
  }, [labels]);

  const handleClickFreeField = async (val: string, id: string) => {
    await navigator.clipboard.writeText(val);
    setCopiedValue(id);
    setTimeout(() => setCopiedValue(""), 2000);
  };

  return <>
    <div className="legendWrapper">
      {groups.map((group) => <div className="legendGroup" key={group}>
        <div className="legendGroupTitle">
          <span className="legendGroupQuery">Query {group}</span>
          <svg className="legendGroupLine" width="33" height="3" version="1.1" xmlns="http://www.w3.org/2000/svg">
            <line strokeWidth="3" x1="0" y1="0" x2="33" y2="0" stroke="#363636"
              strokeDasharray={getDashLine(group).join(",")}
            />
          </svg>
          <b>&quot;{query[group - 1]}&quot;:</b>
        </div>
        <div>
          {labels.filter(l => l.group === group).map((legendItem: LegendItem) =>
            <div className={legendItem.checked ? "legendItem" : "legendItem legendItemHide"}
              key={`${legendItem.group}.${legendItem.label}`}
              onClick={(e) => onChange(legendItem, e.ctrlKey || e.metaKey)}>
              <div className="legendMarker"
                style={{
                  borderColor: legendItem.color,
                  backgroundColor: `rgba(${hexToRGB(legendItem.color)}, 0.1)`
                }}/>
              <div className="legendLabel">
                {legendItem.freeFormFields.__name__ || `Query ${legendItem.group} result`}
                {!!Object.keys(legendItem.freeFormFields).length && <>
                  &#160;&#123;
                  {Object.keys(legendItem.freeFormFields).filter(f => f !== "__name__").map((f) => {
                    const freeField = `${f}="${legendItem.freeFormFields[f]}"`;
                    const fieldId = `${legendItem.group}.${legendItem.label}.${freeField}`;
                    return <Tooltip arrow key={f} open={copiedValue === fieldId} title={"Copied!"}>
                      <span className="legendFreeFields" onClick={(e) => {
                        e.stopPropagation();
                        handleClickFreeField(freeField, fieldId);
                      }}>
                        {f}: {legendItem.freeFormFields[f]}
                      </span>
                    </Tooltip>;
                  })}
                  &#125;
                </>}
              </div>
            </div>
          )}
        </div>
      </div>)}
    </div>
    <div className="legendWrapperHotkey">
      <p><code>Left click</code> - select series</p>
      <p><code>Ctrl</code> + <code>Left click</code> - toggle multiple series</p>
    </div>

  </>;
};

export default Legend;