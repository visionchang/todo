import { Dialog, Input, Popover, Slider, Toast } from 'antd-mobile';
import { useEffect, useState } from 'react';
import cs from 'classnames';
import {
  SortableContainer,
  SortableElement,
  SortEnd,
} from 'react-sortable-hoc';
import iconDrag from '../../assets/icons/drag.svg';
import iconChecked from '../../assets/icons/checked.svg';
import iconUncheck from '../../assets/icons/uncheck.svg';
import iconDelete from '../../assets/icons/delete.svg';
import iconPin from '../../assets/icons/pin.svg';
import iconPinFill from '../../assets/icons/pin-fill.svg';
import iconOpacity from '../../assets/icons/opacity.svg';
import './index.less';
import dayjs from 'dayjs';

const _prefix = 'home';

const tempList = window.electron.store.get('itemList') as Item[];
const tempPin = window.electron.store.get('pin');
const tempOpacity = window.electron.store.get('opacity') as number;
const Home = () => {
  const [itemValue, setItemValue] = useState('');
  const [itemList, setItemList] = useState<Item[]>(tempList || []);
  const [pin, setPin] = useState(tempPin || true);
  const [opacity, setOpacity] = useState(tempOpacity || 100);
  useEffect(() => {
    window.electron.store.set('itemList', itemList);
  }, [itemList]);
  useEffect(() => {
    window.electron.store.set('pin', pin);
    window.electron.ipcRenderer.send('pin', pin);
  }, [pin]);
  useEffect(() => {
    window.electron.store.set('opacity', opacity);
    window.electron.ipcRenderer.send('opacity', opacity / 100);
  }, [opacity]);

  function addItem(newItem: Item) {
    const newItemList = [newItem, ...itemList];
    setItemList(newItemList);
  }

  function handleEnterPress() {
    addItem({
      id: crypto.randomUUID(),
      title: itemValue,
      status: 'active',
      startTime: Date.now(),
    });
    setItemValue('');
  }

  function updateItem(id: string, props: Partial<Item>) {
    const currentIndex = itemList.findIndex((item) => item.id === id);
    if (currentIndex > -1) {
      const currentItem = itemList[currentIndex];
      const newItem = { ...currentItem, ...props };
      itemList.splice(currentIndex, 1, newItem);
    }
    setItemList([...itemList]);
  }

  function deleteItem(id: string) {
    Dialog.confirm({
      content: '确认删除？',
      onConfirm: () => {
        const currentIndex = itemList.findIndex((item) => item.id === id);
        itemList.splice(currentIndex, 1);
        setItemList([...itemList]);
      },
    });
  }

  type ItemProps = {
    value: Item;
  };

  const ListItem = SortableElement<ItemProps>(
    ({ value: { id, title, status, finishTime, startTime } }: ItemProps) => {
      const isDone = status === 'done';
      // return <div>{title}</div>;
      return (
        <div className={cs('item-container', { done: isDone })} key={id}>
          <img src={iconDrag} alt="drag" />
          <span className="clickable">
            {status === 'active' && (
              <img
                src={iconUncheck}
                alt="check"
                onClick={() => {
                  updateItem(id, { status: 'done', finishTime: Date.now() });
                }}
              />
            )}
            {status === 'done' && (
              <img
                src={iconChecked}
                alt="check"
                onClick={() => {
                  updateItem(id, { status: 'active' });
                }}
              />
            )}
          </span>
          <Input
            defaultValue={title}
            onBlur={(e) => {
              updateItem(id, { title: e.target.value });
            }}
            // onChange={(v) => {
            //   updateItem(id, { title: v });
            // }}
          />
          <span className="clickable">
            <img
              src={iconDelete}
              alt="delete"
              onClick={() => {
                deleteItem(id);
              }}
            />
          </span>
          <span className="item-finish-time">
            {startTime ? dayjs(startTime).format('YYYY/MM/DD') : ''}
            {finishTime ? ` - ${dayjs(finishTime).format('YYYY/MM/DD')}` : ''}
          </span>
        </div>
      );
    }
  );

  type ContiainerProps = {
    items: Item[];
  };

  const ListContainer = SortableContainer<ContiainerProps>(
    ({ items }: ContiainerProps) => {
      return (
        <div>
          {items.map((value, index) => {
            return <ListItem key={value.id} index={index} value={value} />;
          })}
        </div>
      );
    }
  );

  return (
    <div className={`${_prefix}`}>
      <div className={`${_prefix}-drag`}>
        <Popover
          placement="bottom"
          trigger="click"
          content={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              80
              <div style={{ width: '210px' }}>
                <Slider
                  min={80}
                  value={opacity}
                  onChange={(value: number | number[]) => {
                    if (typeof value === 'number') {
                      setOpacity(value);
                      Toast.show(`${value}`);
                    }
                  }}
                />
              </div>
              100
            </div>
          }
        >
          <div>
            <img src={iconOpacity} alt="opacity" />
          </div>
        </Popover>
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            setPin(!pin);
          }}
        >
          <img src={pin ? iconPinFill : iconPin} alt="pin" />
        </div>
      </div>
      <Input
        className="new-item"
        value={itemValue}
        onChange={setItemValue}
        onEnterPress={() => {
          handleEnterPress();
        }}
        placeholder="添加新的代办事项"
      />
      <div className="item-list">
        <ListContainer
          items={itemList}
          helperClass="dragging"
          shouldCancelStart={(e) => {
            const target = e?.target as HTMLImageElement;
            if (target?.tagName === 'IMG' && target?.alt === 'drag') {
              return false;
            }
            return true;
          }}
          onSortEnd={(result: SortEnd) => {
            const { newIndex, oldIndex } = result;
            const tempItem = itemList.splice(oldIndex, 1)[0];
            itemList.splice(newIndex, 0, tempItem);
            setItemList([...itemList]);
          }}
        />
      </div>
    </div>
  );
};
export default Home;
