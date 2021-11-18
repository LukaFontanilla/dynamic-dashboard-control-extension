/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2020 Looker Data Sciences, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import React, { useCallback, useContext, useState, useEffect } from 'react'
import { LookerEmbedSDK, LookerEmbedDashboard, LookerDashboardOptions, LookerEmbedEvent, ElementOptionItems, ElementOptions } from '@looker/embed-sdk'
import { ExtensionContext } from '@looker/extension-sdk-react'
import { EmbedContainer } from './EmbedContainer'
import { Heading, Space, InputColor, MessageBar, Paragraph, Button, ButtonToggle, ButtonItem, SpaceVertical, Box, Select} from '@looker/components'

interface dashProps {
  id: number
}

export const EmbedDashboard: React.FC<dashProps> = ({id}) => {
  const [dashboard, setDashboard] = useState<LookerEmbedDashboard>()
  const context = useContext(ExtensionContext)
  const [show, setShow] = useState(false)
  const [vis, setVis] = useState({})


  ///////// event listener functions ///
  
  const canceller = (event:any) => {
    return { cancel: !event.modal }
  }

  // const resizeContent = (height) => {
  //   var elem = document.getElementById('looker-embed').firstChild
  //   elem.setAttribute('height', height)
  // }

  // const updateUI = (show, callback) => {
  //   setShow(show);
  //   callback();
  // }

  // const revertUI = () => {
  //     setTimeout(() => setShow(false), 5000)
  // }

  /// Dynamic Dashboard Controls

  const handleChange = (event:any) => {
    dashboard?.updateFilters({
      'State': event
    })
    dashboard?.run()
  }

  const saveVisSettings = (vis:ElementOptions) => {
    setVis(vis)
      if(dashboard){ 
      dashboard.setOptions({
        elements: vis
      })
    }
  }

  // Color Swatch Handler
  const changeColor = (dashboard:LookerEmbedDashboard | undefined,vis:ElementOptions,event:any) => {
    const newVis = vis
    Object.keys(newVis).forEach((key:string,index) => {
      if(newVis[key].vis_config && (newVis[key].vis_config!.series_colors || newVis[key].vis_config!.map_value_colors || newVis[key].vis_config!.custom_color)){
        if(newVis[key].vis_config!.series_colors){
        Object.keys(newVis[key].vis_config!.series_colors).forEach((key2,index) => {
          newVis[key].vis_config!.series_colors[key2] = event
        })
        } else if(newVis[key].vis_config!.map_value_colors) {
          newVis[key].vis_config!.map_value_colors.pop()
          newVis[key].vis_config!.map_value_colors.push(event)
        } else if(newVis[key].vis_config!.custom_color) {
          newVis[key].vis_config!.custom_color = event
        }
      }
    })
    saveVisSettings(newVis)
  }

  // Change Vis Style Handler
  const handleClick = (dashboard:LookerEmbedDashboard | undefined,vis:ElementOptions,event:any) => {
    const newVis = vis
    Object.keys(newVis).forEach((key,index) => {
      if(newVis[key].vis_config && (newVis[key].vis_config!.type !== 'looker_map' && newVis[key].vis_config!.type !== 'single_value')){
        newVis[key].vis_config!.type = `looker_${event.toLowerCase()}`
      }
    })
    saveVisSettings(newVis)
  }

  // Change Point Style Handler
  const handleClick2 = (dashboard:LookerEmbedDashboard | undefined,vis:ElementOptions,event:any) => {
    const newVis = vis
    Object.keys(newVis).forEach((key,index) => {
      if(newVis[key].vis_config && newVis[key].vis_config!.series_point_styles){
        Object.keys(newVis[key].vis_config!.series_point_styles).forEach((key2,index) => {
          newVis[key].vis_config!.series_point_styles[key2] = event.toLowerCase()
        })
      } 
    })  
    saveVisSettings(newVis)
  }

  // Show or Hide Vis Title Handler
  const handleClick3 = (dashboard:LookerEmbedDashboard | undefined,vis:ElementOptions,event:any) => {
    const newVis = vis
    Object.keys(newVis).forEach((key,index) => {
      if(newVis[key]){
        if(event == "Show Title"){
          if(newVis[key].vis_config && newVis[key].vis_config!.show_single_value_title) {
            newVis[key].title_hidden = false
            newVis[key].vis_config!.show_single_value_title = true
          } else {
            newVis[key].title_hidden = false
          }
        } else {
          if(newVis[key].vis_config && newVis[key].vis_config!.show_single_value_title) {
            newVis[key].title_hidden = true
            newVis[key].vis_config!.show_single_value_title = false
          } else {
            newVis[key].title_hidden = true
          }
        }
      }
    })  
    saveVisSettings(newVis)
  }
  /////////////////////////////////

  /////////////////////////////////

  const embedCtrRef = useCallback(
    (el) => {
      const hostUrl = context?.extensionSDK?.lookerHostData?.hostUrl
      if (el && hostUrl) {
        context.extensionSDK.track('extension.data_portal.load_dashboard', 'dashboard-component-rendered')
        el.innerHTML = ''
        LookerEmbedSDK.init(hostUrl)
        LookerEmbedSDK.createDashboardWithId(id)
          .appendTo(el)
          .withClassName('looker-dashboard')
          .withNext()
          // .withFilters({'user.name': value})
          // .on('page:properties:changed', (e) => resizeContent(e.height))
          .on('drillmenu:click', canceller)
          .on('drillmodal:explore', canceller)
          // .on('dashboard:tile:explore', canceller)
          .on('dashboard:tile:view', canceller)
          .on('dashboard:loaded',(e: any) => setVis(e.dashboard.options.elements))
          .build()
          .connect()
          .then(setDashboard)
          .catch((error) => {
            console.error('Connection error', error)
          })
      }
    },
    [id]
  )

  return (
    <>
    <Box m="40px">
    <SpaceVertical paddingBottom="20px">
      <Heading fontSize="xxxlarge" textAlign="left">Dynamic Dashboard Controls</Heading>
      <Paragraph>Examples of different ways to interact with dashboard from components outside of the embed iframe. Leverages the embed sdk as well as various
      event listeners. Not all vis' have the same structure and fields, so there will need to be more checks for each new viz added that may have a different layout than others.
      Currently the single value viz and map viz are not set to listen to the viz type change actions.</Paragraph>
      <Space>
        <ButtonToggle onChange={(e) => handleClick(dashboard,vis,e)} id="run-dashboard">
          <ButtonItem>Line</ButtonItem>
          <ButtonItem>Column</ButtonItem>
          <ButtonItem>Bar</ButtonItem>
        </ButtonToggle>
        <ButtonToggle onChange={(e) => handleClick2(dashboard,vis,e)} id="run-dashboard">
          <ButtonItem>Circle</ButtonItem>
          <ButtonItem>Diamond</ButtonItem>
          <ButtonItem>Triangle</ButtonItem>
        </ButtonToggle>
        <ButtonToggle onChange={(e) => handleClick3(dashboard,vis,e)} id="run-dashboard">
          <ButtonItem>Show Title</ButtonItem>
          <ButtonItem>Hide Title</ButtonItem>
        </ButtonToggle>
        <InputColor defaultValue="red" onChange={(e) => changeColor(dashboard,vis,e.currentTarget.value)} id="run-dashboard" />
        <Select
          options={[
            { value: 'CA', label: 'California' },
            { value: 'LA', label: 'Lousianna' },
            { value: 'WA', label: 'Washington' },
          ]}
          // value={value}
          onChange={(e:any) => handleChange(e)}
        />
      </Space>
    </SpaceVertical>
    <EmbedContainer id='looker-embed' ref={embedCtrRef} />
    </Box>
    </>
  )
}