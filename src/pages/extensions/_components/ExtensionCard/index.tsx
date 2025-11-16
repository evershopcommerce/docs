/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Link from '@docusaurus/Link';
import Image from '@theme/IdealImage';
import {
  Tags,
  TagList,
  type TagType,
  type Extension,
  type Tag,
} from '@site/src/data/extensions';
import {sortBy} from '@site/src/utils/jsUtils';
import Heading from '@theme/Heading';

const TagComp = React.forwardRef<HTMLLIElement, Tag>(
  ({label, color, description}, ref) => (
    <li ref={ref} title={description} className='bg-[#F4F5F6] py-[6px] px-3 text-sm text-Neutrals-03 inline-block leading-5 capitalize rounded-lg'>
      <span >{label.toLowerCase()}</span>
    </li>
  ),
);

function ExtensionCardTag({tags}: {tags: TagType[]}) {
  const tagObjects = tags.map((tag) => ({tag, ...Tags[tag]}));

  // Keep same order for all tags
  const tagObjectsSorted = sortBy(tagObjects, (tagObject) =>
    TagList.indexOf(tagObject.tag),
  );

  return (
    <>
      {tagObjectsSorted.map((tagObject, index) => {
        const id = `extension_card_tag_${tagObject.tag}`;
        return (
          <TagComp key={index} {...tagObject} />
        );
      })}
    </>
  );
}

function ExtensionCard({extension}: {extension: Extension}) {
  return (
    <div key={extension.title} className="border bg-white border-Neutrals-06 rounded-[20px] p-2 pb-6 shadow-extension">
      <div className='extension__image'>
        <Image img={extension.preview} />
      </div>
      <div className='p-3 pb-0'>
        <ul className="list-none pl-0 mt-5">
        <ExtensionCardTag tags={extension.tags} />
        </ul>
        <div className="mt-4">
          <div className='flex justify-between'>
            <Heading as="h3" className='mb-1 text-xl font-semibold'>
              <Link href={extension.npm} className="text-Neutrals-01">
                {extension.title}
              </Link>
            </Heading>
            {extension.price && (
              <span className="text-primary font-semibold text-lg">
                {extension.price}$
              </span>
            )}
            {!extension.price && (
              <span className="text-primary font-semibold text-lg">Free</span>
            )}
          </div>
          <p className='text-Neutrals-04 mb-0'>{extension.description}</p>
        </div>
        <div className='flex justify-between mt-4 items-center'>
          <div className='flex justify-start gap-2 items-center'>
            <div className='w-8 h-8 bg-primary-02 flex justify-center items-center rounded-full'><img src='/img/logo.svg' alt='EverShop' width={15} height={15} /></div>
            <span className='text-Neutrals-04 text-base'>{extension.author}</span>
          </div>
          {extension.npm && (<a href={extension.npm} target='_blank' className='font-semibold'>Download</a>)}
          {extension.demo && (<a href={extension.demo} target='_blank' className='font-semibold'>Live Demo</a>)}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ExtensionCard);
