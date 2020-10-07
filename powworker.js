/*
    hush-hush: anonymous message board using the onionr network
    Copyright (C) 2020 Kevin Froman

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
importScripts("onionr-jspow/index.js")
importScripts("sha3.js")

self.addEventListener('message', function(e) {
  var data = JSON.parse(e.data)
  console.debug(data.metadata)
  self.postMessage(
    doPow(
    data.metadata,
    data.data,
    data.difficulty
  ));
}, false);